// ems-client/src/components/Dashboard/EmployeeDashboard.jsx
import { useMemo, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import TaskListNumbers from "../other/TaskListNumbers";
import TaskList from "../TaskList/TaskList";
import TaskProgress from "../Employee/TaskProgress";
import UpcomingDeadlines from "../Employee/UpcomingDeadlines";
import Notes from "../Employee/Notes";

function EmployeeDashboard() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const myTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.employeeEmail?.toLowerCase() === user?.email?.toLowerCase()
      ),
    [tasks, user?.email]
  );

  const taskStats = useMemo(() => {
    const stats = { new: 0, accepted: 0, completed: 0, failed: 0 };
    myTasks.forEach((t) => {
      if (t.status === "pending") stats.new += 1;
      else if (t.status === "in_progress") stats.accepted += 1;
      else if (t.status === "completed") stats.completed += 1;
      else if (t.status === "failed") stats.failed += 1;
    });
    return stats;
  }, [myTasks]);

  return (
    <>
      {/* Page heading */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
          My Workspace
        </h1>
        <p className="text-sm text-gray-500">
          Overview of your tasks, progress, and upcoming deadlines.
        </p>
      </div>

      {/* Top stats row */}
      <div className="mb-6">
        <TaskListNumbers taskStats={taskStats} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
        {/* Left column */}
        <div className="flex flex-col gap-6 h-full">
          {/* Assigned Tasks */}
          <section className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <header className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                  Assigned Tasks
                </h2>
                <p className="text-xs text-gray-400">
                  Tasks currently assigned to you.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                {myTasks.length} task{myTasks.length !== 1 ? "s" : ""}
              </span>
            </header>
            <div className="flex-1 px-3 sm:px-5 py-3 max-h-[230px] overflow-y-auto">
              <TaskList tasks={myTasks} />
            </div>
          </section>

          {/* Upcoming deadlines */}
          <section className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <header className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Upcoming Deadlines
              </h2>
              <p className="text-xs text-gray-400">
                Stay ahead on your due dates.
              </p>
            </header>
            <div className="flex-1 px-4 sm:px-5 py-3 max-h-[260px] overflow-y-auto">
              <UpcomingDeadlines
                tasks={myTasks}
                showAll={showAllUpcoming}
                onShowAllChange={setShowAllUpcoming}
              />
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 h-full">
          {/* Task progress */}
          <section className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <header className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Task Progress
              </h2>
              <p className="text-xs text-gray-400">
                Visual breakdown of your current workload.
              </p>
            </header>
            <div className="flex-1 px-4 sm:px-5 py-4">
              <TaskProgress tasks={myTasks} />
            </div>
          </section>

          {/* Notes */}
          <section className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <header className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Notes
              </h2>
              <p className="text-xs text-gray-400">
                Save quick reminders for yourself.
              </p>
            </header>
            <div className="flex-1 px-4 sm:px-5 py-3">
              <Notes />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default EmployeeDashboard;
