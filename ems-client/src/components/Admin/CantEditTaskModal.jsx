// ems-client/src/components/Admin/CantEditTaskModal.jsx
import TaskModalWrapper from "./TaskModalWrapper";

function CantEditTaskModal({ open, onClose }) {
  if (!open) return null;

  return (
    <TaskModalWrapper title="Task locked" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <p className="text-gray-700">
          This task is already <span className="font-semibold">completed</span>.
          Completed tasks cannot be edited.
        </p>
        <p className="text-xs text-gray-400">
          If you need to change details, create a new task instead.
        </p>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Okay
          </button>
        </div>
      </div>
    </TaskModalWrapper>
  );
}

export default CantEditTaskModal;
