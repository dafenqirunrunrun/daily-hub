import { useCallback, useEffect, useState } from "react";
import type {
  CreateIdeaInput,
  CreateTaskInput,
  DailyHubState,
  ToggleTaskInput,
  UpdateTaskInput,
  UpsertReviewInput
} from "../shared/dailyHub";

interface UseDailyHubResult {
  state: DailyHubState | null;
  databasePath: string | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  toggleTask: (input: ToggleTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createIdea: (input: CreateIdeaInput) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  upsertReview: (input: UpsertReviewInput) => Promise<void>;
}

export function useDailyHub(date: string): UseDailyHubResult {
  const [state, setState] = useState<DailyHubState | null>(null);
  const [databasePath, setDatabasePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    const [nextState, dbPath] = await Promise.all([
      window.dailyHub!.getState(date),
      window.dailyHub!.getDatabasePath()
    ]);
    setState(nextState);
    setDatabasePath(dbPath);
    setError(null);
  }, [date]);

  const reload = useCallback(async () => {
    if (!window.dailyHub) {
      setState(null);
      setError("学习记录暂时无法读取 · 请在 Electron 中打开");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      await fetchState();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "学习记录暂时无法读取");
    } finally {
      setIsLoading(false);
    }
  }, [fetchState]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const runAndReload = useCallback(
    async (operation: () => Promise<unknown>) => {
      if (!window.dailyHub) {
        setError("学习记录暂时无法读取 · 请在 Electron 中打开");
        return;
      }

      try {
        await operation();
        await fetchState();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "学习记录暂时无法读取");
      }
    },
    [fetchState]
  );

  return {
    state,
    databasePath,
    isLoading,
    error,
    reload,
    createTask: (input) =>
      runAndReload(() => window.dailyHub!.createTask(input)),
    updateTask: (input) =>
      runAndReload(() => window.dailyHub!.updateTask(input)),
    toggleTask: (input) =>
      runAndReload(() => window.dailyHub!.toggleTask(input)),
    deleteTask: (id) =>
      runAndReload(() => window.dailyHub!.deleteTask(id)),
    createIdea: (input) =>
      runAndReload(() => window.dailyHub!.createIdea(input)),
    deleteIdea: (id) =>
      runAndReload(() => window.dailyHub!.deleteIdea(id)),
    upsertReview: async (input) => {
      if (!window.dailyHub) {
        setError("学习记录暂时无法读取 · 请在 Electron 中打开");
        return;
      }

      try {
        const review = await window.dailyHub.upsertReview(input);
        setState((current) =>
          current && current.date === input.date
            ? {
                ...current,
                review
              }
            : current
        );
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "学习记录暂时无法读取");
      }
    }
  };
}
