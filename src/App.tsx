import { useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Workspace } from "./components/Workspace";
import { useDailyHub } from "./hooks/useDailyHub";
import { getLocalDateString, type DailyHubView } from "./shared/dailyHub";

export function App() {
  const today = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeView, setActiveView] = useState<DailyHubView>("plan");
  const dailyHub = useDailyHub(selectedDate);

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        dailyHubState={dailyHub.state}
        selectedDate={selectedDate}
        onCreateIdea={dailyHub.createIdea}
        onSelectView={setActiveView}
      />
      <Workspace
        activeView={activeView}
        databasePath={dailyHub.databasePath}
        dailyHubState={dailyHub.state}
        error={dailyHub.error}
        isLoading={dailyHub.isLoading}
        selectedDate={selectedDate}
        today={today}
        onCreateIdea={dailyHub.createIdea}
        onCreateTask={dailyHub.createTask}
        onDateChange={setSelectedDate}
        onDeleteIdea={dailyHub.deleteIdea}
        onDeleteTask={dailyHub.deleteTask}
        onReload={dailyHub.reload}
        onSelectView={setActiveView}
        onToggleTask={dailyHub.toggleTask}
        onUpdateTask={dailyHub.updateTask}
        onUpsertReview={dailyHub.upsertReview}
      />
    </div>
  );
}
