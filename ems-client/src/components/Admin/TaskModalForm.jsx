// ems-client/src/components/Admin/TaskModalForm.jsx
import Modal from "./TaskModalWrapper";

function TaskModalForm({ mode = "add", taskForm, onChange, onSubmit, onClose }) {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  // 🔽 dynamic text based on mode
  const titleText = mode === "edit" ? "Edit task" : "Add task";
  const buttonText = mode === "edit" ? "Save changes" : "Create task";

  return (
    <Modal title={titleText} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">
            Task title
          </label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={taskForm.title}
            onChange={handleFieldChange("title")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Employee name
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={taskForm.employeeName}
              onChange={handleFieldChange("employeeName")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Employee email
            </label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={taskForm.employeeEmail}
              onChange={handleFieldChange("employeeEmail")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Priority
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={taskForm.priority}
              onChange={handleFieldChange("priority")}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Due date
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={taskForm.dueDate}
              onChange={handleFieldChange("dueDate")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">
            Description
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={taskForm.description}
            onChange={handleFieldChange("description")}
            placeholder="Short description of the task..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {buttonText}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskModalForm;
