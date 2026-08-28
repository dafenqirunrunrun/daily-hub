import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { registerDailyHubIpc } from "./dailyHubIpc.js";
import { DailyHubRepository } from "./dailyHubRepository.js";

const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
let repository: DailyHubRepository | null = null;

if (process.env.DAILY_HUB_USER_DATA_PATH) {
  app.setPath("userData", process.env.DAILY_HUB_USER_DATA_PATH);
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    title: "Daily Hub",
    backgroundColor: "#1f1e1b",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    void window.loadURL("http://127.0.0.1:32123");
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  void window.loadFile(path.join(__dirname, "../../dist/index.html"));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  repository = new DailyHubRepository(
    process.env.DAILY_HUB_DB_PATH ??
      path.join(app.getPath("userData"), "daily-hub.sqlite")
  );
  registerDailyHubIpc(repository);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  repository?.close();
  repository = null;
});
