import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { DailyHubApi } from "./shared/dailyHub";

function mockDailyHubApi(): DailyHubApi {
  return {
    getState: vi.fn().mockResolvedValue({
      date: "2026-08-28",
      tasks: [],
      ideas: [],
      review: null,
      progress: {
        completed: 0,
        total: 0,
        percentage: null
      }
    }),
    getTasksByDate: vi.fn().mockResolvedValue([]),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    getIdeasByDate: vi.fn().mockResolvedValue([]),
    createIdea: vi.fn(),
    deleteIdea: vi.fn(),
    getReviewByDate: vi.fn().mockResolvedValue(null),
    upsertReview: vi.fn(),
    getDatabasePath: vi.fn().mockResolvedValue("test.sqlite")
  };
}

describe("App", () => {
  beforeEach(() => {
    window.dailyHub = mockDailyHubApi();
  });

  it("renders the local Daily Hub app", async () => {
    render(<App />);

    expect(screen.getByRole("complementary", { name: /daily hub navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /今天 · Daily Hub/ })).toBeInTheDocument();
    expect(await screen.findByText("本地 SQLite 已连接")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /今日计划/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /学习进度/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /随手想法/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /今日复盘/i }).length).toBeGreaterThan(0);
  });
});
