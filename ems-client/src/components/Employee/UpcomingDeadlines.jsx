// ems-client/src/components/Employee/UpcomingDeadlines.jsx

function UpcomingDeadlines({ tasks = [], showAll = false, onShowAllChange }) {
  const today = startOfDay(new Date());

  const upcomingAll = tasks
    .filter((t) => t.dueDate && t.status !== "completed" && t.status !== "failed")
    .filter((t) => {
      const d = startOfDay(new Date(t.dueDate));
      return d >= today;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (upcomingAll.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-sm text-gray-500 text-center px-4">
        <p>No upcoming deadlines.</p>
        <p className="text-xs text-gray-400 mt-1">
          New tasks will appear here when they have due dates.
        </p>
      </div>
    );
  }

  const { todayList, weekList, laterList } = groupByRange(upcomingAll, today);

  const VISIBLE_LIMIT = 2;
  const visible = upcomingAll.slice(0, VISIBLE_LIMIT);
  const hasMore = upcomingAll.length > VISIBLE_LIMIT;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top: range summary */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <SummaryChip label="Today" count={todayList.length} color="blue" />
        <SummaryChip label="This week" count={weekList.length} color="indigo" />
        <SummaryChip label="Later" count={laterList.length} color="gray" />
      </div>

      {/* Middle: grouped list fills height */}
      <div className="flex-1 rounded-xl border border-gray-100 bg-white px-3 py-2 overflow-y-auto">
        {visible.map((task, index) => {
          const dateLabel = humanDateLabel(task.dueDate, today);
          const showDateHeader =
            index === 0 ||
            humanDateLabel(visible[index - 1].dueDate, today) !== dateLabel;

          return (
            <div key={task.id}>
              {showDateHeader && (
                <div className="mt-2 first:mt-0 mb-1 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-white" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Due at {formatTime(task.dueDate)}
                  </p>
                </div>
                <span className={priorityPill(task.priority)}>
                  {formatPriority(task.priority)}
                </span>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <p className="mt-2 text-[11px] text-gray-400">
            +{upcomingAll.length - visible.length} more deadlines not shown
          </p>
        )}
      </div>

      {/* Bottom: View all only when there are more than we show */}
      {hasMore && onShowAllChange && (
        <button
          type="button"
          onClick={() => onShowAllChange(true)}
          className="self-end text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all ({upcomingAll.length})
        </button>
      )}

      {showAll && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onShowAllChange(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Upcoming deadlines
                </h3>
                <p className="text-[11px] text-gray-400">
                  {upcomingAll.length} task
                  {upcomingAll.length !== 1 ? "s" : ""} with due dates
                </p>
              </div>
              <button
                type="button"
                onClick={() => onShowAllChange(false)}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Sub-header summary strip */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Closest deadlines are shown first
                </span>
                <span className="hidden sm:inline text-[10px]">
                  Grouped by Today / This week / Later
                </span>
              </div>
            </div>

            {/* List */}
            <div className="px-4 pb-3 pt-1 overflow-y-auto text-sm bg-white">
              {upcomingAll.map((task, index) => {
                const dateLabel = humanDateLabel(task.dueDate, today);
                const showDateHeader =
                  index === 0 ||
                  humanDateLabel(upcomingAll[index - 1].dueDate, today) !== dateLabel;

                return (
                  <div key={task.id}>
                    {showDateHeader && (
                      <div className="mt-3 first:mt-1 mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          {dateLabel}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300/80 to-transparent" />
                      </div>
                    )}

                    <div className="group flex items-start justify-between gap-3 rounded-xl px-2 py-2 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-950">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gray-300" />
                          {formatFullDate(task.dueDate)} · {formatTime(task.dueDate)}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span className={priorityPill(task.priority)}>
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers (same as before) */

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function groupByRange(list, today) {
  const oneDay = 24 * 60 * 60 * 1000;
  const weekEnd = new Date(today.getTime() + 7 * oneDay);

  const todayList = [];
  const weekList = [];
  const laterList = [];

  list.forEach((t) => {
    const d = startOfDay(new Date(t.dueDate));
    if (d.getTime() === today.getTime()) {
      todayList.push(t);
    } else if (d > today && d <= weekEnd) {
      weekList.push(t);
    } else {
      laterList.push(t);
    }
  });

  return { todayList, weekList, laterList };
}

function humanDateLabel(dueDate, today) {
  const date = startOfDay(new Date(dueDate));
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return "This week";
  return "Later";
}

function formatTime(dueDate) {
  const date = new Date(dueDate);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(dueDate) {
  const date = new Date(dueDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  const s = String(priority);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function priorityPill(priority) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap";
  if (priority === "high")
    return `${base} bg-red-50 text-red-700 border-red-100`;
  if (priority === "low")
    return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
  return `${base} bg-amber-50 text-amber-700 border-amber-100`;
}

function SummaryChip({ label, count, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }[color];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${colors}`}
    >
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-[11px] font-semibold">{count}</span>
    </span>
  );
}

export default UpcomingDeadlines;
