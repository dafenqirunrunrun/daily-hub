import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  CirclePlus,
  ClipboardList,
  Gauge,
  Lightbulb,
  SquarePen
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import type {
  CreateIdeaInput,
  DailyHubState,
  DailyHubView
} from "../shared/dailyHub";
import { getReviewStatus } from "../shared/dailyHub";

interface DailyHubSectionProps {
  activeView: DailyHubView | null;
  state: DailyHubState | null;
  selectedDate: string;
  onCreateIdea: (input: CreateIdeaInput) => Promise<void>;
  onSelectView: (view: DailyHubView) => void;
}

export function DailyHubSection({
  activeView,
  state,
  selectedDate,
  onCreateIdea,
  onSelectView
}: DailyHubSectionProps) {
  const [isExpanded, setIsExpanded] = useLocalStorageState(
    "dailyHub.sidebarExpanded",
    true,
    (value) => value === "true",
    String
  );
  const [isQuickAddingIdea, setIsQuickAddingIdea] = useState(false);
  const [ideaContent, setIdeaContent] = useState("");
  const ideaInputRef = useRef<HTMLInputElement | null>(null);
  const completedTasks = state?.progress.completed ?? 0;
  const plannedTasks = state?.progress.total ?? 0;
  const progress = state?.progress.percentage ?? null;
  const reviewStatus = getReviewStatus(state?.review ?? null);

  useEffect(() => {
    if (isQuickAddingIdea) {
      ideaInputRef.current?.focus();
    }
  }, [isQuickAddingIdea]);

  async function saveQuickIdea() {
    const content = ideaContent.trim();

    if (!content) {
      return;
    }

    await onCreateIdea({ date: selectedDate, content });
    setIdeaContent("");
    setIsQuickAddingIdea(false);
  }

  function cancelQuickIdea() {
    setIdeaContent("");
    setIsQuickAddingIdea(false);
  }

  return (
    <section className="daily-hub" aria-label="学习记录">
      <div className="section-divider" />
      <button
        className="section-header"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className="section-title">
          <SquarePen aria-hidden="true" size={15} strokeWidth={1.8} />
          学习记录
        </span>
        {isExpanded ? (
          <ChevronUp aria-hidden="true" size={15} strokeWidth={1.8} />
        ) : (
          <ChevronDown aria-hidden="true" size={15} strokeWidth={1.8} />
        )}
      </button>

      <div className={isExpanded ? "daily-hub-body" : "daily-hub-body collapsed"}>
        <button
          className={activeView === "plan" ? "sidebar-row hub-row active" : "sidebar-row hub-row"}
          type="button"
          onClick={() => onSelectView("plan")}
        >
          <span className="row-main">
            <ClipboardList aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>今日计划</span>
          </span>
          <span className="row-meta">
            {completedTasks} / {plannedTasks}
          </span>
        </button>

        <button
          className={activeView === "plan" ? "sidebar-row hub-row active" : "sidebar-row hub-row"}
          type="button"
          onClick={() => onSelectView("plan")}
        >
          <span className="row-main">
            <Gauge aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>学习进度</span>
          </span>
          {progress === null ? (
            <span className="row-meta muted">今天还没有计划</span>
          ) : (
            <span className="progress-meta">
              <span>{progress}%</span>
              <ProgressRing value={progress} />
            </span>
          )}
        </button>

        <div className={activeView === "ideas" ? "hub-row-wrap active" : "hub-row-wrap"}>
          <button
            className="sidebar-row hub-row idea-row-button"
            type="button"
            onClick={() => onSelectView("ideas")}
          >
            <span className="row-main">
              <Lightbulb aria-hidden="true" size={15} strokeWidth={1.8} />
              <span>随手想法</span>
            </span>
          </button>
          <button
            className="sidebar-icon-button"
            type="button"
            aria-label="快速添加随手想法"
            onClick={() => setIsQuickAddingIdea(true)}
          >
            <CirclePlus aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
        </div>

        {isQuickAddingIdea ? (
          <input
            ref={ideaInputRef}
            aria-label="侧栏随手想法"
            className="sidebar-quick-input"
            value={ideaContent}
            placeholder="记下一句话"
            onChange={(event) => setIdeaContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void saveQuickIdea();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelQuickIdea();
              }
            }}
          />
        ) : null}

        <button
          className={activeView === "review" ? "sidebar-row hub-row active" : "sidebar-row hub-row"}
          type="button"
          onClick={() => onSelectView("review")}
        >
          <span className="row-main">
            <CheckCheck aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>今日复盘</span>
          </span>
          <span className={reviewStatus === "未填写" ? "row-meta muted" : "row-meta"}>
            {reviewStatus}
          </span>
        </button>
      </div>

      <div className="section-divider" />
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <svg
      className="progress-ring"
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
    >
      <circle className="progress-ring-track" cx="7" cy="7" r={radius} />
      <circle
        className="progress-ring-value"
        cx="7"
        cy="7"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}
