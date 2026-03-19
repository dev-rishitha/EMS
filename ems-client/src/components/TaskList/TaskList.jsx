// ems-client/src/components/TaskList/TaskList.jsx

function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        No tasks assigned to you yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-xl border border-gray-100 bg-white hover:bg-blue-50/40 hover:border-blue-100 
                     transition flex items-start justify-between gap-3 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {task.description}
              </p>
            )}

            <div className="mt-1 flex items-center gap-2">
              {task.dueDate && (
                <p className="text-[11px] text-gray-400">
                  Due: {formatDueDate(task.dueDate)}
                </p>
              )}
              {task.status && (
                <span className={statusBadge(task.status)}>
                  {formatStatus(task.status)}
                </span>
              )}
            </div>
          </div>

          <span className={priorityBadge(task.priority)}>
            {formatPriority(task.priority)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function priorityBadge(priority) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border";

  if (priority === "high") {
    return `${base} bg-rose-50 text-rose-700 border-rose-100`;
  }
  if (priority === "medium") {
    return `${base} bg-amber-50 text-amber-700 border-amber-100`;
  }
  return `${base} bg-blue-50 text-blue-700 border-blue-100`;
}

function statusBadge(status) {
  const base =
    "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border";

  if (status === "completed") {
    return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
  }
  if (status === "in_progress") {
    return `${base} bg-sky-50 text-sky-700 border-sky-100`;
  }
  if (status === "failed" || status === "blocked") {
    return `${base} bg-rose-50 text-rose-700 border-rose-100`;
  }
  return `${base} bg-gray-50 text-gray-600 border-gray-100`;
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  const s = String(priority);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatStatus(status) {
  if (!status) return "";
  if (status === "in_progress") return "In progress";
  if (status === "failed") return "Blocked";
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDueDate(dueDate) {
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default TaskList;
