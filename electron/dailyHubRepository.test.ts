import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { calculateTaskProgress } from "../src/shared/dailyHub.js";
import { DailyHubRepository } from "./dailyHubRepository.js";

let cleanupPaths: string[] = [];

function createRepository() {
  const directory = mkdtempSync(path.join(os.tmpdir(), "daily-hub-test-"));
  cleanupPaths.push(directory);

  return {
    directory,
    databasePath: path.join(directory, "test.sqlite"),
    repository: new DailyHubRepository(path.join(directory, "test.sqlite"))
  };
}

afterEach(() => {
  for (const cleanupPath of cleanupPaths) {
    rmSync(cleanupPath, { recursive: true, force: true });
  }
  cleanupPaths = [];
});

describe("DailyHubRepository", () => {
  it("reads a task after createTask", () => {
    const { repository } = createRepository();
    const task = repository.createTask({
      date: "2026-08-28",
      title: "阅读论文"
    });

    expect(repository.getTasksByDate("2026-08-28")).toEqual([task]);

    repository.close();
  });

  it("updates completed correctly after toggleTask", () => {
    const { repository } = createRepository();
    const task = repository.createTask({
      date: "2026-08-28",
      title: "写代码"
    });

    expect(repository.toggleTask({ id: task.id }).completed).toBe(true);
    expect(repository.toggleTask({ id: task.id }).completed).toBe(false);

    repository.close();
  });

  it("does not read a task after deleteTask", () => {
    const { repository } = createRepository();
    const task = repository.createTask({
      date: "2026-08-28",
      title: "整理笔记"
    });

    repository.deleteTask(task.id);

    expect(repository.getTasksByDate("2026-08-28")).toEqual([]);

    repository.close();
  });

  it("calculates progress from task completion state", () => {
    expect(calculateTaskProgress([])).toEqual({
      completed: 0,
      total: 0,
      percentage: null
    });
    expect(
      calculateTaskProgress([
        { completed: false },
        { completed: false },
        { completed: false },
        { completed: false }
      ])
    ).toEqual({ completed: 0, total: 4, percentage: 0 });
    expect(
      calculateTaskProgress([
        { completed: true },
        { completed: true },
        { completed: false },
        { completed: false }
      ])
    ).toEqual({ completed: 2, total: 4, percentage: 50 });
    expect(
      calculateTaskProgress([
        { completed: true },
        { completed: true },
        { completed: true },
        { completed: true }
      ])
    ).toEqual({ completed: 4, total: 4, percentage: 100 });
  });

  it("reads an idea after createIdea", () => {
    const { repository } = createRepository();
    const idea = repository.createIdea({
      date: "2026-08-28",
      content: "把复盘变成明天的起点"
    });

    expect(repository.getIdeasByDate("2026-08-28")).toEqual([idea]);

    repository.close();
  });

  it("reads an upserted review after reopening the repository", () => {
    const { databasePath, repository } = createRepository();

    repository.upsertReview({
      date: "2026-08-28",
      completedSummary: "完成数据层",
      blocker: "原生依赖需要验证",
      nextAction: "做人工验收"
    });
    repository.close();

    const reopenedRepository = new DailyHubRepository(databasePath);

    expect(reopenedRepository.getReviewByDate("2026-08-28")).toMatchObject({
      date: "2026-08-28",
      completedSummary: "完成数据层",
      blocker: "原生依赖需要验证",
      nextAction: "做人工验收"
    });

    reopenedRepository.close();
  });

  it("keeps different dates isolated", () => {
    const { repository } = createRepository();

    const todayTask = repository.createTask({
      date: "2026-08-28",
      title: "今天的任务"
    });
    const tomorrowTask = repository.createTask({
      date: "2026-08-29",
      title: "明天的任务"
    });
    repository.createIdea({
      date: "2026-08-29",
      content: "另一天的想法"
    });
    repository.upsertReview({
      date: "2026-08-29",
      completedSummary: "另一天完成",
      blocker: "",
      nextAction: ""
    });

    expect(repository.getTasksByDate("2026-08-28")).toEqual([todayTask]);
    expect(repository.getTasksByDate("2026-08-29")).toEqual([tomorrowTask]);
    expect(repository.getIdeasByDate("2026-08-28")).toEqual([]);
    expect(repository.getReviewByDate("2026-08-28")).toBeNull();

    repository.close();
  });
});
