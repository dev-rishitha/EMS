import Modal from "./TaskModalWrapper";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TaskModalView({ task, onClose, onEdit, priorityBadge, statusBadge, displayStatusLabel }) {
  if (!task) return null;  

  return (
    <Modal title="Task details" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
              Task
            </p>
            <p className="text-gray-900 font-semibold text-base">
              {task.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created {formatDateTime(task.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={priorityBadge(task.priority)}>
              Priority: {task.priority}
            </span>
            <span className={statusBadge(task.status)}>
              Status: {displayStatusLabel(task.status)}
            </span>
            {task.dueDate && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                Due: {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
            Employee
          </p>
          <p className="text-gray-900 font-medium">
            {task.employeeName}
          </p>
          <p className="text-xs text-gray-400">
            {task.employeeEmail}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
            Description
          </p>
          <p className="text-gray-700 leading-relaxed">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onEdit(task)}     // ✅ call parent
          >
            Edit task
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default TaskModalView;
