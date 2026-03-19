// ems-client/src/components/Admin/AdminTaskTable.jsx
import { Link } from "react-router-dom";

function AdminTaskTable({ tasks }) {
  return (
    <div className="h-full max-h-[420px] overflow-x-auto overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
          <tr>
            <Th>Task</Th>
            <Th>Assigned To</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-5 py-8 text-center text-gray-400 text-sm"
              >
                No tasks created yet
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <Td className="font-medium text-gray-800">
                  <Link
                    to={`/admin/tasks`}
                    className="hover:underline"
                  >
                    {task.title}
                  </Link>
                </Td>

                <Td>
                  {task.employeeName ? (
                    <div className="flex flex-col">
                      <span className="text-gray-800">
                        {task.employeeName}
                      </span>
                      {task.employeeEmail && (
                        <span className="text-xs text-gray-400">
                          {task.employeeEmail}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </Td>

                <Td>
                  <StatusBadge status={task.status} />
                </Td>

                <Td>
                  <PriorityBadge priority={task.priority} />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 text-left font-medium whitespace-nowrap text-xs uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-5 py-3 text-gray-700 align-middle ${className}`}>
      {children}
    </td>
  );
}

function PriorityBadge({ priority }) {
  const normalized =
    typeof priority === "string" ? priority.toLowerCase() : "medium";

  const styles = {
    high: "bg-rose-50 text-rose-700 border border-rose-100",
    medium: "bg-amber-50 text-amber-700 border border-amber-100",
    low: "bg-blue-50 text-blue-700 border border-blue-100",
  };

  const label =
    normalized.charAt(0).toUpperCase() + normalized.slice(1);

  const base =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium";

  return (
    <span className={`${base} ${styles[normalized] || styles.medium}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized =
    typeof status === "string" ? status.toLowerCase() : "pending";

  const styles = {
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    "in_progress": "bg-sky-50 text-sky-700 border border-sky-100",
    pending: "bg-gray-50 text-gray-700 border border-gray-200",
    failed: "bg-rose-50 text-rose-700 border border-rose-100",
  };

  let label = normalized;
  if (normalized === "in_progress") label = "In progress";
  else label = label.charAt(0).toUpperCase() + label.slice(1);

  const base =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium";

  return (
    <span className={`${base} ${styles[normalized] || styles.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default AdminTaskTable;
