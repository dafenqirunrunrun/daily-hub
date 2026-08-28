import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";
import type {
  CreateIdeaInput,
  CreateTaskInput,
  DailyHubState,
  DailyHubView,
  DailyTask,
  ToggleTaskInput,
  UpdateTaskInput,
  UpsertReviewInput
} from "../shared/dailyHub";

interface WorkspaceProps {
  activeView: DailyHubView;
  databasePath: string | null;
  dailyHubState: DailyHubState | null;
  error: string | null;
  isLoading: boolean;
  selectedDate: string;
  today: string;
  onCreateIdea: (input: CreateIdeaInput) => Promise<void>;
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
  onDateChange: (date: string) => void;
  onDeleteIdea: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onReload: () => Promise<void>;
  onSelectView: (view: DailyHubView) => void;
  onToggleTask: (input: ToggleTaskInput) => Promise<void>;
  onUpdateTask: (input: UpdateTaskInput) => Promise<void>;
  onUpsertReview: (input: UpsertReviewInput) => Promise<void>;
}

export function Workspace({
  activeView,
  databasePath,
  dailyHubState,
  error,
  isLoading,
  selectedDate,
  today,
  onCreateIdea,
  onCreateTask,
  onDateChange,
  onDeleteIdea,
  onDeleteTask,
  onReload,
  onSelectView,
  onToggleTask,
  onUpdateTask,
  onUpsertReview
}: WorkspaceProps) {
  return (
    <main className="workspace">
      <div className="workspace-topbar">
        <div className="date-slab" aria-hidden="true">
          <span>{formatMonthLabel(selectedDate)}</span>
          <strong>{formatDayLabel(selectedDate)}</strong>
          <span>{formatWeekdayLabel(selectedDate)}</span>
        </div>
        <div className="workspace-heading">
          <h1>{selectedDate === today ? "今天" : formatDateLabel(selectedDate)} · Daily Hub</h1>
          <p>{databasePath ? "本地 SQLite 已连接" : "本地优先保存"}</p>
        </div>
        <div className="date-tools">
          <button
            className="icon-button"
            type="button"
            aria-label="前一天"
            onClick={() => onDateChange(addDays(selectedDate, -1))}
          >
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.9} />
          </button>
          <label className="date-control">
            <span>日期</span>
            <input
              aria-label="选择日期"
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
            />
          </label>
          <button
            className="icon-button"
            type="button"
            aria-label="后一天"
            onClick={() => onDateChange(addDays(selectedDate, 1))}
          >
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.9} />
          </button>
          {selectedDate !== today ? (
            <button className="quiet-button" type="button" onClick={() => onDateChange(today)}>
              回到今天
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="error-state" role="alert">
          <span>{error}</span>
          <button className="quiet-button" type="button" onClick={() => void onReload()}>
            <RefreshCw aria-hidden="true" size={15} strokeWidth={1.9} />
            重试
          </button>
        </div>
      ) : null}

      {isLoading ? <div className="loading-state">学习记录读取中...</div> : null}

      {!isLoading && dailyHubState ? (
        <>
          {activeView === "plan" ? (
            <TodayPlanView
              state={dailyHubState}
              onCreateTask={onCreateTask}
              onDeleteTask={onDeleteTask}
              onToggleTask={onToggleTask}
              onUpdateTask={onUpdateTask}
            />
          ) : null}

          {activeView === "ideas" ? (
            <IdeasView
              state={dailyHubState}
              onCreateIdea={onCreateIdea}
              onDeleteIdea={onDeleteIdea}
            />
          ) : null}

          {activeView === "review" ? (
            <DailyReviewView state={dailyHubState} onUpsertReview={onUpsertReview} />
          ) : null}

          <section className="review-strip" aria-label="Daily Hub sections">
            <button className="link-button" type="button" onClick={() => onSelectView("plan")}>
              今日计划
            </button>
            <button className="link-button" type="button" onClick={() => onSelectView("ideas")}>
              随手想法
            </button>
            <button className="link-button" type="button" onClick={() => onSelectView("review")}>
              今日复盘
            </button>
          </section>
        </>
      ) : null}
    </main>
  );
}

interface DailyViewProps {
  state: DailyHubState;
}

interface TodayPlanViewProps extends DailyViewProps {
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleTask: (input: ToggleTaskInput) => Promise<void>;
  onUpdateTask: (input: UpdateTaskInput) => Promise<void>;
}

function TodayPlanView({
  state,
  onCreateTask,
  onDeleteTask,
  onToggleTask,
  onUpdateTask
}: TodayPlanViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const progressLabel =
    state.progress.percentage === null
      ? "今天还没有计划"
      : `${state.progress.percentage}%`;
  const progressWidth = state.progress.percentage ?? 0;

  useEffect(() => {
    if (isAdding) {
      addInputRef.current?.focus();
    }
  }, [isAdding, state.tasks.length]);

  useEffect(() => {
    if (editingTaskId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingTaskId]);

  async function createTaskAndContinue() {
    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    await onCreateTask({ date: state.date, title });
    setNewTaskTitle("");
    setIsAdding(true);
  }

  function cancelAdd() {
    setNewTaskTitle("");
    setIsAdding(false);
  }

  function startEditing(task: DailyTask) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }

  async function saveEditing(task: DailyTask) {
    const title = editingTitle.trim();

    if (!title) {
      cancelEditing();
      return;
    }

    if (title !== task.title) {
      await onUpdateTask({ id: task.id, title });
    }

    setEditingTaskId(null);
    setEditingTitle("");
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditingTitle("");
  }

  return (
    <section className="plan-view" aria-label="今日计划">
      <div className="view-header">
        <div>
          <h2>今日计划</h2>
          <p>
            完成 {state.progress.completed} / {state.progress.total} · {progressLabel}
          </p>
        </div>
      </div>

      <div className={state.tasks.length === 0 ? "progress-board empty" : "progress-board"}>
        <div>
          <span>今日完成</span>
          <strong>{state.tasks.length === 0 ? "未计划" : progressLabel}</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      {isAdding ? (
        <div className="inline-form">
          <input
            ref={addInputRef}
            aria-label="新任务标题"
            value={newTaskTitle}
            placeholder={state.tasks.length === 0 ? "添加第一项" : "添加任务"}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void createTaskAndContinue();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelAdd();
              }
            }}
          />
          <button className="quiet-button" type="button" onClick={() => void createTaskAndContinue()}>
            <Plus aria-hidden="true" size={16} strokeWidth={1.9} />
            添加
          </button>
        </div>
      ) : (
        <button
          className="inline-add-button"
          type="button"
          onClick={() => setIsAdding(true)}
        >
          <Plus aria-hidden="true" size={16} strokeWidth={1.9} />
          {state.tasks.length === 0 ? "添加第一项" : "添加任务"}
        </button>
      )}

      {state.tasks.length === 0 ? (
        <div className="empty-state">今天还没有计划</div>
      ) : (
        <div className="task-list">
          {state.tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <div className="task-row editable-task-row" key={task.id}>
                <button
                  className="icon-button"
                  type="button"
                  role="checkbox"
                  aria-checked={task.completed}
                  aria-label={task.completed ? "取消完成任务" : "完成任务"}
                  onClick={() => void onToggleTask({ id: task.id })}
                  onKeyDown={(event) => {
                    if (event.key === " ") {
                      event.preventDefault();
                    }
                  }}
                  onKeyUp={(event) => {
                    if (event.key === " ") {
                      event.preventDefault();
                      void onToggleTask({ id: task.id });
                    }
                  }}
                >
                  {task.completed ? (
                    <CheckCircle2
                      className="task-icon done"
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.9}
                    />
                  ) : (
                    <Circle
                      className="task-icon"
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}
                </button>

                {isEditing ? (
                  <input
                    ref={editInputRef}
                    aria-label="编辑任务标题"
                    className="task-title-input editing"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onBlur={() => void saveEditing(task)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void saveEditing(task);
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditing();
                      }
                    }}
                  />
                ) : (
                  <button
                    className={task.completed ? "task-title-button done" : "task-title-button"}
                    type="button"
                    onDoubleClick={() => startEditing(task)}
                    onClick={() => startEditing(task)}
                  >
                    {task.title}
                  </button>
                )}

                <button
                  className="icon-button"
                  type="button"
                  aria-label="编辑任务"
                  onClick={() => startEditing(task)}
                >
                  <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="删除任务"
                  onClick={() => void onDeleteTask(task.id)}
                >
                  <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface IdeasViewProps extends DailyViewProps {
  onCreateIdea: (input: CreateIdeaInput) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
}

function IdeasView({ state, onCreateIdea, onDeleteIdea }: IdeasViewProps) {
  const [content, setContent] = useState("");

  async function handleCreateIdea() {
    const nextContent = content.trim();

    if (!nextContent) {
      return;
    }

    await onCreateIdea({ date: state.date, content: nextContent });
    setContent("");
  }

  return (
    <section className="plan-view" aria-label="随手想法">
      <div className="view-header">
        <div>
          <h2>随手想法</h2>
          <p>{state.ideas.length} 条当天记录</p>
        </div>
      </div>

      <div className="inline-form">
        <input
          aria-label="随手想法内容"
          value={content}
          placeholder="记下一句话"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreateIdea();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setContent("");
            }
          }}
        />
        <button className="quiet-button" type="button" onClick={() => void handleCreateIdea()}>
          <Plus aria-hidden="true" size={16} strokeWidth={1.9} />
          保存
        </button>
      </div>

      <div className="idea-list">
        {state.ideas.map((idea) => (
          <div className="idea-row" key={idea.id}>
            <div>
              <p>{idea.content}</p>
              <time>{new Date(idea.createdAt).toLocaleTimeString()}</time>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="删除想法"
              onClick={() => void onDeleteIdea(idea.id)}
            >
              <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

interface DailyReviewViewProps extends DailyViewProps {
  onUpsertReview: (input: UpsertReviewInput) => Promise<void>;
}

function DailyReviewView({ state, onUpsertReview }: DailyReviewViewProps) {
  const [completedSummary, setCompletedSummary] = useState("");
  const [blocker, setBlocker] = useState("");
  const [nextAction, setNextAction] = useState("");
  const hasEditedRef = useRef(false);
  const latestValuesRef = useRef({
    completedSummary: "",
    blocker: "",
    nextAction: ""
  });

  useEffect(() => {
    hasEditedRef.current = false;
    const nextValues = {
      completedSummary: state.review?.completedSummary ?? "",
      blocker: state.review?.blocker ?? "",
      nextAction: state.review?.nextAction ?? ""
    };
    latestValuesRef.current = nextValues;
    setCompletedSummary(nextValues.completedSummary);
    setBlocker(nextValues.blocker);
    setNextAction(nextValues.nextAction);
  }, [state.date, state.review]);

  const saveReview = useCallback(() => {
    const values = latestValuesRef.current;
    hasEditedRef.current = false;
    return onUpsertReview({
      date: state.date,
      completedSummary: values.completedSummary,
      blocker: values.blocker,
      nextAction: values.nextAction
    });
  }, [onUpsertReview, state.date]);

  useEffect(() => {
    latestValuesRef.current = {
      completedSummary,
      blocker,
      nextAction
    };

    if (!hasEditedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveReview();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [blocker, completedSummary, nextAction, saveReview]);

  useEffect(() => {
    function saveBeforeLeaving() {
      if (hasEditedRef.current) {
        void saveReview();
      }
    }

    window.addEventListener("beforeunload", saveBeforeLeaving);
    return () => {
      saveBeforeLeaving();
      window.removeEventListener("beforeunload", saveBeforeLeaving);
    };
  }, [saveReview]);

  function markEdited() {
    hasEditedRef.current = true;
  }

  return (
    <section className="plan-view review-view" aria-label="今日复盘">
      <div className="view-header">
        <div>
          <h2>今日复盘</h2>
          <p>内容会自动保存</p>
        </div>
      </div>

      <label className="review-field">
        <span>今天完成了什么？</span>
        <textarea
          value={completedSummary}
          onBlur={() => void saveReview()}
          onChange={(event) => {
            markEdited();
            setCompletedSummary(event.target.value);
          }}
        />
      </label>

      <label className="review-field">
        <span>卡在哪里？</span>
        <textarea
          value={blocker}
          onBlur={() => void saveReview()}
          onChange={(event) => {
            markEdited();
            setBlocker(event.target.value);
          }}
        />
      </label>

      <label className="review-field">
        <span>明天第一件事是什么？</span>
        <textarea
          value={nextAction}
          onBlur={() => void saveReview()}
          onChange={(event) => {
            markEdited();
            setNextAction(event.target.value);
          }}
        />
      </label>
    </section>
  );
}

function addDays(date: string, days: number): string {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + days);

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, "0");
  const day = String(nextDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);
  return `${parsedDate.getMonth() + 1}月${parsedDate.getDate()}日`;
}

function formatMonthLabel(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);
  return `${parsedDate.getMonth() + 1}月`;
}

function formatDayLabel(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);
  return String(parsedDate.getDate()).padStart(2, "0");
}

function formatWeekdayLabel(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(parsedDate);
}
