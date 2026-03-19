// ems-client/src/components/Employee/TaskProgress.jsx

function TaskProgress({ tasks = [] }) {
  const totals = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;

  const completedPct = totals ? Math.round((completed / totals) * 100) : 0;
  const inProgressPct = totals ? Math.round((inProgress / totals) * 100) : 0;
  const pendingPct = totals ? Math.round((pending / totals) * 100) : 0;

  // for conic gradient
  const completedEnd = completedPct;
  const inProgressEnd = completedPct + inProgressPct;
  const pendingEnd = completedPct + inProgressPct + pendingPct; // 0–100

  return (
    <div className="h-full w-full flex flex-col text-sm">
      {/* Top: title + summary */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.14em]">
            Overall completion
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {totals === 0
              ? "No tasks assigned yet"
              : `${totals} task${totals !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Middle: circular progress + legend */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-2 sm:mb-3 flex-1">
        {/* Circular chart */}
        <div className="flex items-center justify-center">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32">
            {/* Outer ring using conic-gradient */}
            <div
              className="h-full w-full rounded-full"
              style={{
                backgroundImage: `conic-gradient(
                  #1d4ed8 0deg,
                  #1d4ed8 ${completedEnd * 3.6}deg,
                  #0ea5e9 ${completedEnd * 3.6}deg,
                  #0ea5e9 ${inProgressEnd * 3.6}deg,
                  #e5e7eb ${inProgressEnd * 3.6}deg,
                  #e5e7eb ${pendingEnd * 3.6}deg
                )`,
              }}
            />
            {/* Inner cutout */}
            <div className="absolute inset-2 sm:inset-3 rounded-full bg-white flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {completedPct}%
                </span>
                <span className="text-[11px] text-gray-500">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-1 gap-2 text-[11px]">
          <LegendItem
            label="Completed"
            value={completed}
            pct={completedPct}
            dotColor="bg-blue-600"
          />
          <LegendItem
            label="In progress"
            value={inProgress}
            pct={inProgressPct}
            dotColor="bg-sky-400"
          />
          <LegendItem
            label="Pending"
            value={pending}
            pct={pendingPct}
            dotColor="bg-gray-300"
          />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, value, pct, dotColor }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-100">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span className="text-[11px] font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <span className="font-semibold text-gray-800">{value}</span>
        <span>•</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

export default TaskProgress;
