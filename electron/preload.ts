import { contextBridge, ipcRenderer } from "electron";
import type {
  CreateIdeaInput,
  CreateTaskInput,
  DailyHubApi,
  ToggleTaskInput,
  UpdateTaskInput,
  UpsertReviewInput
} from "../src/shared/dailyHub.js";

const dailyHubApi: DailyHubApi = {
  getState: (date: string) => ipcRenderer.invoke("dailyHub:getState", date),
  getTasksByDate: (date: string) =>
    ipcRenderer.invoke("dailyHub:getTasksByDate", date),
  createTask: (input: CreateTaskInput) =>
    ipcRenderer.invoke("dailyHub:createTask", input),
  updateTask: (input: UpdateTaskInput) =>
    ipcRenderer.invoke("dailyHub:updateTask", input),
  toggleTask: (input: ToggleTaskInput) =>
    ipcRenderer.invoke("dailyHub:toggleTask", input),
  deleteTask: (id: string) => ipcRenderer.invoke("dailyHub:deleteTask", id),
  getIdeasByDate: (date: string) =>
    ipcRenderer.invoke("dailyHub:getIdeasByDate", date),
  createIdea: (input: CreateIdeaInput) =>
    ipcRenderer.invoke("dailyHub:createIdea", input),
  deleteIdea: (id: string) => ipcRenderer.invoke("dailyHub:deleteIdea", id),
  getReviewByDate: (date: string) =>
    ipcRenderer.invoke("dailyHub:getReviewByDate", date),
  upsertReview: (input: UpsertReviewInput) =>
    ipcRenderer.invoke("dailyHub:upsertReview", input),
  getDatabasePath: () => ipcRenderer.invoke("dailyHub:getDatabasePath")
};

contextBridge.exposeInMainWorld("dailyHub", dailyHubApi);
