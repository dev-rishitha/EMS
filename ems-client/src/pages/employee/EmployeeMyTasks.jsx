import { useMemo, useState, useEffect } from "react";
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
// ✅ FIXED PATH (go up 2 levels, then into components)

// TEMP: replace with real logged-in user
// const CURRENT_EMPLOYEE_EMAIL = "john@example.com";

function EmployeeMyTasks() {
  const { user } = useAuth();           // ✅ current user
  const { tasks, updateTaskStatusFromEmployee, resetEmployeeNewTaskCount } = useTasks();

  useEffect(() => {
    resetEmployeeNewTaskCount();
  }, [resetEmployeeNewTaskCount]);

  // Only tasks for this employee
  const myTasks = useMemo(
    () =>
      tasks.filter((task) => task.employeeEmail?.toLowerCase() === user?.email?.toLowerCase()),
    [tasks, user?.email]
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    return myTasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" ? true : task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ? true : task.priority === priorityFilter;
      const matchesSearch =
        !search.trim() ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [myTasks, statusFilter, priorityFilter, search]);

  const handleStatusChange = (task, newStatus) => {
    updateTaskStatusFromEmployee(task.id, newStatus);
  };

  return (
    // <div className="h-screen bg-gray-100 flex">
     <>
        {/* Page header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
            My Tasks
          </h1>
          <p className="text-sm text-gray-500">
            View and update the tasks assigned to you.
          </p>
        </div>

        {/* Filters bar */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm px-3 sm:px-5 py-3 sm:py-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status + Priority filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All status</option>
                <option value="pending">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Desktop table */}
        <section className="hidden md:block">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="overflow-y-auto max-h-[480px]">
              <table className="w-full text-sm table-auto">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Task</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td
                        className="px-6 py-8 text-center text-gray-500"
                        colSpan={5}
                      >
                        No tasks found.
                      </td>
                    </tr>
                  )}
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-xs text-gray-400 line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={priorityBadge(task.priority)}>
                          {formatPriority(task.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusBadge(task.status)}>
                          {statusLabel(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {task.dueDate ? (
                          formatDueDate(task.dueDate)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task, e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-full border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Not started</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Mobile cards */}
        <section className="space-y-3 md:hidden mt-4">
          {filteredTasks.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-5 text-center text-gray-500 shadow-sm">
              No tasks found.
            </div>
          )}
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-3"
            >
              {/* Top row: title + status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <span className={statusBadge(task.status)}>
                  {statusLabel(task.status)}
                </span>
              </div>

              {/* Priority + due */}
              <div className="flex items-center justify-between text-xs text-gray-700">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase">
                    Priority
                  </p>
                  <span className={priorityBadge(task.priority)}>
                    {formatPriority(task.priority)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-gray-500 uppercase">
                    Due
                  </p>
                  <p className="mt-0.5">
                    {task.dueDate ? (
                      formatDueDate(task.dueDate)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status change */}
              <div className="flex justify-end">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                  className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </section>
      </>
    // </div>
  );
}

/* Helpers */

function priorityBadge(priority) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium";
  if (priority === "high")
    return `${base} bg-red-50 text-red-700 border border-red-100`;
  if (priority === "medium")
    return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
  return `${base} bg-blue-50 text-blue-700 border border-blue-100`;
}

function statusBadge(status) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium";
  if (status === "pending")
    return `${base} bg-gray-50 text-gray-700 border border-gray-100`;
  if (status === "in_progress")
    return `${base} bg-indigo-50 text-indigo-700 border border-indigo-100`;
  return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`;
}

function statusLabel(status) {
  if (status === "pending") return "Not started";
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Unknown";
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  const s = String(priority);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// add near bottom with other helpers
function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default EmployeeMyTasks;
