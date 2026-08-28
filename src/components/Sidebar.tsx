import { DailyHubSection } from "./DailyHubSection";
import type {
  CreateIdeaInput,
  DailyHubView,
  DailyHubState
} from "../shared/dailyHub";

interface SidebarProps {
  activeView: DailyHubView;
  dailyHubState: DailyHubState | null;
  selectedDate: string;
  onCreateIdea: (input: CreateIdeaInput) => Promise<void>;
  onSelectView: (view: DailyHubView) => void;
}

export function Sidebar({
  activeView,
  dailyHubState,
  selectedDate,
  onCreateIdea,
  onSelectView
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Daily Hub navigation">
      <div className="brand-row">
        <div className="brand-button" aria-label="Daily Hub">
          <span className="brand-mark">D</span>
          <span>Daily Hub</span>
        </div>
      </div>

      <DailyHubSection
        activeView={activeView}
        state={dailyHubState}
        selectedDate={selectedDate}
        onCreateIdea={onCreateIdea}
        onSelectView={onSelectView}
      />
    </aside>
  );
}
