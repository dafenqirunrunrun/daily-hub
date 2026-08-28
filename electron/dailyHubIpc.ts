import { ipcMain } from "electron";
import type {
  CreateIdeaInput,
  CreateTaskInput,
  ToggleTaskInput,
  UpdateTaskInput,
  UpsertReviewInput
} from "../src/shared/dailyHub.js";
import type { DailyHubRepository } from "./dailyHubRepository.js";

export function registerDailyHubIpc(repository: DailyHubRepository): void {
  ipcMain.handle("dailyHub:getState", (_event, date: string) =>
    repository.getState(date)
  );
  ipcMain.handle("dailyHub:getTasksByDate", (_event, date: string) =>
    repository.getTasksByDate(date)
  );
  ipcMain.handle("dailyHub:createTask", (_event, input: CreateTaskInput) =>
    repository.createTask(input)
  );
  ipcMain.handle("dailyHub:updateTask", (_event, input: UpdateTaskInput) =>
    repository.updateTask(input)
  );
  ipcMain.handle("dailyHub:toggleTask", (_event, input: ToggleTaskInput) =>
    repository.toggleTask(input)
  );
  ipcMain.handle("dailyHub:deleteTask", (_event, id: string) => {
    repository.deleteTask(id);
  });
  ipcMain.handle("dailyHub:getIdeasByDate", (_event, date: string) =>
    repository.getIdeasByDate(date)
  );
  ipcMain.handle("dailyHub:createIdea", (_event, input: CreateIdeaInput) =>
    repository.createIdea(input)
  );
  ipcMain.handle("dailyHub:deleteIdea", (_event, id: string) => {
    repository.deleteIdea(id);
  });
  ipcMain.handle("dailyHub:getReviewByDate", (_event, date: string) =>
    repository.getReviewByDate(date)
  );
  ipcMain.handle("dailyHub:upsertReview", (_event, input: UpsertReviewInput) =>
    repository.upsertReview(input)
  );
  ipcMain.handle("dailyHub:getDatabasePath", () => repository.databasePath);
}
