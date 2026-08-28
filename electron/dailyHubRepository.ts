import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  calculateTaskProgress,
  type CreateIdeaInput,
  type CreateTaskInput,
  type DailyHubState,
  type DailyReview,
  type DailyTask,
  type QuickIdea,
  type ToggleTaskInput,
  type UpdateTaskInput,
  type UpsertReviewInput
} from "../src/shared/dailyHub.js";

interface DailyTaskRow {
  id: string;
  date: string;
  title: string;
  completed: number;
  priority: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface QuickIdeaRow {
  id: string;
  date: string;
  content: string;
  created_at: string;
}

interface DailyReviewRow {
  date: string;
  completed_summary: string;
  blocker: string;
  next_action: string;
  updated_at: string;
}

export class DailyHubRepository {
  readonly databasePath: string;

  private readonly db: Database.Database;

  constructor(databasePath: string) {
    this.databasePath = databasePath;
    mkdirSync(path.dirname(databasePath), { recursive: true });
    this.db = new Database(databasePath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.initialize();
  }

  close(): void {
    this.db.close();
  }

  getState(date: string): DailyHubState {
    const tasks = this.getTasksByDate(date);

    return {
      date,
      tasks,
      ideas: this.getIdeasByDate(date),
      review: this.getReviewByDate(date),
      progress: calculateTaskProgress(tasks)
    };
  }

  getTasksByDate(date: string): DailyTask[] {
    const rows = this.db
      .prepare(
        `SELECT id, date, title, completed, priority, sort_order, created_at, updated_at
         FROM daily_tasks
         WHERE date = ?
         ORDER BY sort_order ASC, created_at ASC`
      )
      .all(date) as DailyTaskRow[];

    return rows.map(mapTaskRow);
  }

  createTask(input: CreateTaskInput): DailyTask {
    const now = new Date().toISOString();
    const id = randomUUID();
    const title = input.title.trim();

    if (!title) {
      throw new Error("Task title is required.");
    }

    const nextOrder = this.getNextTaskSortOrder(input.date);

    this.db
      .prepare(
        `INSERT INTO daily_tasks
          (id, date, title, completed, priority, sort_order, created_at, updated_at)
         VALUES
          (@id, @date, @title, 0, @priority, @sortOrder, @createdAt, @updatedAt)`
      )
      .run({
        id,
        date: input.date,
        title,
        priority: input.priority ?? null,
        sortOrder: nextOrder,
        createdAt: now,
        updatedAt: now
      });

    return this.requireTask(id);
  }

  updateTask(input: UpdateTaskInput): DailyTask {
    const existing = this.requireTask(input.id);
    const nextTitle = input.title === undefined ? existing.title : input.title.trim();

    if (!nextTitle) {
      throw new Error("Task title is required.");
    }

    this.db
      .prepare(
        `UPDATE daily_tasks
         SET title = @title,
             completed = @completed,
             priority = @priority,
             sort_order = @sortOrder,
             updated_at = @updatedAt
         WHERE id = @id`
      )
      .run({
        id: input.id,
        title: nextTitle,
        completed:
          input.completed === undefined
            ? Number(existing.completed)
            : Number(input.completed),
        priority: input.priority === undefined ? existing.priority : input.priority,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        updatedAt: new Date().toISOString()
      });

    return this.requireTask(input.id);
  }

  toggleTask(input: ToggleTaskInput): DailyTask {
    const existing = this.requireTask(input.id);
    return this.updateTask({
      id: input.id,
      completed: input.completed ?? !existing.completed
    });
  }

  deleteTask(id: string): void {
    this.db.prepare("DELETE FROM daily_tasks WHERE id = ?").run(id);
  }

  getIdeasByDate(date: string): QuickIdea[] {
    const rows = this.db
      .prepare(
        `SELECT id, date, content, created_at
         FROM quick_ideas
         WHERE date = ?
         ORDER BY created_at DESC`
      )
      .all(date) as QuickIdeaRow[];

    return rows.map(mapIdeaRow);
  }

  createIdea(input: CreateIdeaInput): QuickIdea {
    const content = input.content.trim();

    if (!content) {
      throw new Error("Idea content is required.");
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO quick_ideas (id, date, content, created_at)
         VALUES (@id, @date, @content, @createdAt)`
      )
      .run({
        id,
        date: input.date,
        content,
        createdAt
      });

    return this.requireIdea(id);
  }

  deleteIdea(id: string): void {
    this.db.prepare("DELETE FROM quick_ideas WHERE id = ?").run(id);
  }

  getReviewByDate(date: string): DailyReview | null {
    const row = this.db
      .prepare(
        `SELECT date, completed_summary, blocker, next_action, updated_at
         FROM daily_reviews
         WHERE date = ?`
      )
      .get(date) as DailyReviewRow | undefined;

    return row ? mapReviewRow(row) : null;
  }

  upsertReview(input: UpsertReviewInput): DailyReview {
    const updatedAt = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO daily_reviews
          (date, completed_summary, blocker, next_action, updated_at)
         VALUES
          (@date, @completedSummary, @blocker, @nextAction, @updatedAt)
         ON CONFLICT(date) DO UPDATE SET
          completed_summary = excluded.completed_summary,
          blocker = excluded.blocker,
          next_action = excluded.next_action,
          updated_at = excluded.updated_at`
      )
      .run({
        date: input.date,
        completedSummary: input.completedSummary,
        blocker: input.blocker,
        nextAction: input.nextAction,
        updatedAt
      });

    const review = this.getReviewByDate(input.date);

    if (!review) {
      throw new Error("Review could not be saved.");
    }

    return review;
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
        priority INTEGER CHECK (priority IS NULL OR priority BETWEEN 0 AND 2),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_daily_tasks_date_sort
        ON daily_tasks(date, sort_order, created_at);

      CREATE TABLE IF NOT EXISTS quick_ideas (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_quick_ideas_date_created
        ON quick_ideas(date, created_at);

      CREATE TABLE IF NOT EXISTS daily_reviews (
        date TEXT PRIMARY KEY,
        completed_summary TEXT NOT NULL DEFAULT '',
        blocker TEXT NOT NULL DEFAULT '',
        next_action TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      );
    `);
  }

  private getNextTaskSortOrder(date: string): number {
    const row = this.db
      .prepare(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextOrder
         FROM daily_tasks
         WHERE date = ?`
      )
      .get(date) as { nextOrder: number };

    return row.nextOrder;
  }

  private requireTask(id: string): DailyTask {
    const row = this.db
      .prepare(
        `SELECT id, date, title, completed, priority, sort_order, created_at, updated_at
         FROM daily_tasks
         WHERE id = ?`
      )
      .get(id) as DailyTaskRow | undefined;

    if (!row) {
      throw new Error(`Task not found: ${id}`);
    }

    return mapTaskRow(row);
  }

  private requireIdea(id: string): QuickIdea {
    const row = this.db
      .prepare(
        `SELECT id, date, content, created_at
         FROM quick_ideas
         WHERE id = ?`
      )
      .get(id) as QuickIdeaRow | undefined;

    if (!row) {
      throw new Error(`Idea not found: ${id}`);
    }

    return mapIdeaRow(row);
  }
}

function mapTaskRow(row: DailyTaskRow): DailyTask {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    completed: Boolean(row.completed),
    priority: row.priority,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapIdeaRow(row: QuickIdeaRow): QuickIdea {
  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.created_at
  };
}

function mapReviewRow(row: DailyReviewRow): DailyReview {
  return {
    date: row.date,
    completedSummary: row.completed_summary,
    blocker: row.blocker,
    nextAction: row.next_action,
    updatedAt: row.updated_at
  };
}
