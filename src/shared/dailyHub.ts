export type DailyHubView = "plan" | "ideas" | "review";

export interface DailyTask {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  priority: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuickIdea {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface DailyReview {
  date: string;
  completedSummary: string;
  blocker: string;
  nextAction: string;
  updatedAt: string;
}

export interface TaskProgress {
  completed: number;
  total: number;
  percentage: number | null;
}

export interface DailyHubState {
  date: string;
  tasks: DailyTask[];
  ideas: QuickIdea[];
  review: DailyReview | null;
  progress: TaskProgress;
}

export interface CreateTaskInput {
  date: string;
  title: string;
  priority?: number | null;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  completed?: boolean;
  priority?: number | null;
  sortOrder?: number;
}

export interface ToggleTaskInput {
  id: string;
  completed?: boolean;
}

export interface CreateIdeaInput {
  date: string;
  content: string;
}

export interface UpsertReviewInput {
  date: string;
  completedSummary: string;
  blocker: string;
  nextAction: string;
}

export interface DailyHubApi {
  getState(date: string): Promise<DailyHubState>;
  getTasksByDate(date: string): Promise<DailyTask[]>;
  createTask(input: CreateTaskInput): Promise<DailyTask>;
  updateTask(input: UpdateTaskInput): Promise<DailyTask>;
  toggleTask(input: ToggleTaskInput): Promise<DailyTask>;
  deleteTask(id: string): Promise<void>;
  getIdeasByDate(date: string): Promise<QuickIdea[]>;
  createIdea(input: CreateIdeaInput): Promise<QuickIdea>;
  deleteIdea(id: string): Promise<void>;
  getReviewByDate(date: string): Promise<DailyReview | null>;
  upsertReview(input: UpsertReviewInput): Promise<DailyReview>;
  getDatabasePath(): Promise<string>;
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateTaskProgress(tasks: Pick<DailyTask, "completed">[]): TaskProgress {
  const total = tasks.length;

  if (total === 0) {
    return {
      completed: 0,
      total,
      percentage: null
    };
  }

  const completed = tasks.filter((task) => task.completed).length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100)
  };
}

export function isReviewFilled(review: DailyReview | null): boolean {
  return getReviewStatus(review) !== "未填写";
}

export function getReviewStatus(
  review: DailyReview | null
): "未填写" | "进行中" | "已填写" {
  if (!review) {
    return "未填写";
  }

  const fields = [
    review.completedSummary.trim(),
    review.blocker.trim(),
    review.nextAction.trim()
  ];
  const filledCount = fields.filter(Boolean).length;

  if (filledCount === 0) {
    return "未填写";
  }

  return filledCount === fields.length ? "已填写" : "进行中";
}
