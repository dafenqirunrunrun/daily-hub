import { _electron as electron, expect, test, type ElectronApplication, type Page } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const appRoot = path.resolve(__dirname, "..");
const packagedAppPath = path.join(appRoot, "release", "win-unpacked", "Daily Hub.exe");

interface DailyHubHarness {
  app: ElectronApplication;
  directory: string;
  page: Page;
}

async function launchDailyHub(directory = mkdtempSync(path.join(os.tmpdir(), "daily-hub-e2e-"))): Promise<DailyHubHarness> {
  const app = await electron.launch({
    executablePath: packagedAppPath,
    env: {
      ...process.env,
      DAILY_HUB_DB_PATH: path.join(directory, "daily-hub.sqlite"),
      DAILY_HUB_USER_DATA_PATH: path.join(directory, "user-data")
    }
  });
  const page = await app.firstWindow();
  await expect(page.getByRole("heading", { name: /今天 · Daily Hub/ })).toBeVisible();

  return { app, directory, page };
}

async function closeDailyHub(app: ElectronApplication | null) {
  if (!app) {
    return;
  }

  await Promise.race([
    app.close(),
    new Promise((resolve) => {
      setTimeout(resolve, 5_000);
    })
  ]);
}

function cleanup(directory: string) {
  try {
    rmSync(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch {
    // Windows may hold Electron's Local Storage files briefly after app.close().
  }
}

function sidebar(page: Page) {
  return page.locator(".daily-hub");
}

function workspace(page: Page) {
  return page.locator(".workspace");
}

async function openDailyPlan(page: Page) {
  await sidebar(page).getByRole("button", { name: /今日计划/ }).click();
  await expect(page.getByRole("heading", { name: /今天 · Daily Hub/ })).toBeVisible();
}

test("E2E 1 - Daily Plan persists after restart", async () => {
  let harness: DailyHubHarness | null = null;
  let directory = "";

  try {
    harness = await launchDailyHub();
    directory = harness.directory;
    await openDailyPlan(harness.page);

    const main = workspace(harness.page);
    await main.getByRole("button", { name: "添加第一项" }).click();
    for (const title of ["任务 A", "任务 B", "任务 C"]) {
      await main.getByLabel("新任务标题").fill(title);
      await harness.page.keyboard.press("Enter");
    }

    await main.getByRole("checkbox", { name: "完成任务" }).first().press("Space");
    await expect(main.getByText("完成 1 / 3 · 33%")).toBeVisible();
    await expect(sidebar(harness.page).getByRole("button", { name: /今日计划/ })).toContainText("1 / 3");
    await expect(sidebar(harness.page).getByRole("button", { name: /学习进度/ })).toContainText("33%");

    await closeDailyHub(harness.app);
    harness = await launchDailyHub(directory);
    await openDailyPlan(harness.page);

    const restartedMain = workspace(harness.page);
    await expect(restartedMain.getByText("任务 A")).toBeVisible();
    await expect(restartedMain.getByText("任务 B")).toBeVisible();
    await expect(restartedMain.getByText("完成 1 / 3 · 33%")).toBeVisible();
  } finally {
    await closeDailyHub(harness?.app ?? null);
    cleanup(directory);
  }
});

test("E2E 2 - Sidebar Quick Idea saves and survives restart", async () => {
  let harness: DailyHubHarness | null = null;
  let directory = "";

  try {
    harness = await launchDailyHub();
    directory = harness.directory;

    await sidebar(harness.page).getByRole("button", { name: "快速添加随手想法" }).click();
    await harness.page.getByLabel("侧栏随手想法").fill("测试想法");
    await harness.page.keyboard.press("Enter");
    await expect(harness.page.getByLabel("侧栏随手想法")).toBeHidden();

    await sidebar(harness.page).getByRole("button", { name: "随手想法", exact: true }).click();
    await expect(workspace(harness.page).getByText("测试想法")).toBeVisible();

    await closeDailyHub(harness.app);
    harness = await launchDailyHub(directory);
    await sidebar(harness.page).getByRole("button", { name: "随手想法", exact: true }).click();
    await expect(workspace(harness.page).getByText("测试想法")).toBeVisible();
  } finally {
    await closeDailyHub(harness?.app ?? null);
    cleanup(directory);
  }
});

test("E2E 3 - Review autosaves and reports completed", async () => {
  let harness: DailyHubHarness | null = null;
  let directory = "";

  try {
    harness = await launchDailyHub();
    directory = harness.directory;

    await sidebar(harness.page).getByRole("button", { name: /今日复盘/ }).click();
    await harness.page.getByLabel("今天完成了什么？").fill("完成交互打磨");
    await harness.page.getByLabel("卡在哪里？").fill("没有卡住");
    await harness.page.getByLabel("明天第一件事是什么？").fill("继续验收");
    await expect(sidebar(harness.page).getByRole("button", { name: /今日复盘/ })).toContainText("已填写");

    await sidebar(harness.page).getByRole("button", { name: /今日计划/ }).click();
    await sidebar(harness.page).getByRole("button", { name: /今日复盘/ }).click();
    await expect(harness.page.getByLabel("今天完成了什么？")).toHaveValue("完成交互打磨");
    await expect(harness.page.getByLabel("卡在哪里？")).toHaveValue("没有卡住");
    await expect(harness.page.getByLabel("明天第一件事是什么？")).toHaveValue("继续验收");
  } finally {
    await closeDailyHub(harness?.app ?? null);
    cleanup(directory);
  }
});

test("E2E 4 - Date Isolation", async () => {
  let harness: DailyHubHarness | null = null;
  let directory = "";

  try {
    harness = await launchDailyHub();
    directory = harness.directory;
    await openDailyPlan(harness.page);

    const main = workspace(harness.page);
    await main.getByRole("button", { name: "添加第一项" }).click();
    await main.getByLabel("新任务标题").fill("Today Task");
    await harness.page.keyboard.press("Enter");
    await expect(main.getByText("Today Task")).toBeVisible();

    await harness.page.getByRole("button", { name: "后一天" }).click();
    await expect(main.getByText("Today Task")).toBeHidden();
    await main.getByRole("button", { name: "添加第一项" }).click();
    await main.getByLabel("新任务标题").fill("Other Day Task");
    await harness.page.keyboard.press("Enter");
    await expect(main.getByText("Other Day Task")).toBeVisible();

    await harness.page.getByRole("button", { name: "回到今天" }).click();
    await expect(main.getByText("Today Task")).toBeVisible();
    await expect(main.getByText("Other Day Task")).toBeHidden();
  } finally {
    await closeDailyHub(harness?.app ?? null);
    cleanup(directory);
  }
});

test("E2E 5 - Collapse state persists across restart", async () => {
  let harness: DailyHubHarness | null = null;
  let directory = "";

  try {
    harness = await launchDailyHub();
    directory = harness.directory;

    await sidebar(harness.page).getByRole("button", { name: /学习记录/ }).click();
    await expect(sidebar(harness.page).getByRole("button", { name: /今日计划/ })).toBeHidden();

    await closeDailyHub(harness.app);
    harness = await launchDailyHub(directory);
    await expect(sidebar(harness.page).getByRole("button", { name: /今日计划/ })).toBeHidden();

    await sidebar(harness.page).getByRole("button", { name: /学习记录/ }).click();
    await expect(sidebar(harness.page).getByRole("button", { name: /今日计划/ })).toBeVisible();

    await closeDailyHub(harness.app);
    harness = await launchDailyHub(directory);
    await expect(sidebar(harness.page).getByRole("button", { name: /今日计划/ })).toBeVisible();
  } finally {
    await closeDailyHub(harness?.app ?? null);
    cleanup(directory);
  }
});
