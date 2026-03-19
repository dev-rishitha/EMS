import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTasks } from "../../context/TaskContext";

import { useTaskFilters } from "../../hooks/useTaskFilter";
import AdminTasksHeader from "../../components/Admin/AdminTasksHeader";
import AdminTasksFilters from "../../components/Admin/AdminTasksFilters";
import TaskModalView from "../../components/Admin/TaskModalView";
import TaskModalForm from "../../components/Admin/TaskModalForm";
import TaskModalWrapper from "../../components/Admin/TaskModalWrapper";
import CantEditTaskModal from "../../components/Admin/CantEditTaskModal";

function AdminTasks() {
  const { tasks, createTask, deleteTask, updateTask } = useTasks();
  const sortedTasks = [...tasks].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);
  const location = useLocation();

  const formatCreatedAt = (createdAt) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredTasks
  } = useTaskFilters(sortedTasks);

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "";
    const d = new Date(dueDate);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState(
    location.state?.openCreate ? "add" : null
  ); // "view" | "add" | null

  const [taskForm, setTaskForm] = useState({
    id: null,
    title: "",
    employeeName: "",
    employeeEmail: "",
    priority: "medium",
    dueDate: "",
    description: "",
    status: "pending", // default to pending for new tasks, but will be set to existing value for edits
  });

  const [deleteTarget, setDeleteTarget] = useState(null); // {id, title} | null

  const displayStatusLabel = (status) => {
    if (status === "pending") return "Not started";
    if (status === "in_progress") return "In progress";
    return "Completed";
  };

  const priorityBadge = (priority) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    if (priority === "high")
      return `${base} bg-red-50 text-red-700 border border-red-100`;
    if (priority === "medium")
      return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
    return `${base} bg-blue-50 text-blue-700 border border-blue-100`;
  };

  const statusBadge = (status) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    if (status === "pending")
      return `${base} bg-gray-50 text-gray-700 border border-gray-100`;
    if (status === "in_progress")
      return `${base} bg-indigo-50 text-indigo-700 border border-indigo-100`;
    return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setModalType("view");
  };

  const openAddModal = () => {
    setTaskForm({
      id: Date.now(),
      title: "",
      employeeName: "",
      employeeEmail: "",
      priority: "medium",
      dueDate: "",
      description: ""
    });
    setModalType("add");
  };

  const closeModal = () => {
    setSelectedTask(null);
    setModalType(null);
  };

  const handleTaskFormChange = (field, value) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (
      !taskForm.title.trim() ||
      !taskForm.employeeName.trim() ||
      !taskForm.employeeEmail.trim()
    ) {
      alert("Title, employee name and email are required.");
      return;
    }
    createTask(taskForm);
    closeModal();
  };

  const [showCantEdit, setShowCantEdit] = useState(false);

  const openEditModal = (task) => {
    if (task.status === "completed") {
      setShowCantEdit(true);
      return;
    }

    setTaskForm({
      id: task.id,
      title: task.title,
      employeeName: task.employeeName,
      employeeEmail: task.employeeEmail,
      priority: task.priority,
      dueDate: task.dueDate || "",
      description: task.description || "",
      status: task.status,        // ← add this
    });
    setModalType("edit");
  };

  const handleEditTaskSubmit = (e) => {
    e.preventDefault();

    console.log("EDIT SUBMIT taskForm:", taskForm); // add this

    if (
      !taskForm.title.trim() ||
      !taskForm.employeeName.trim() ||
      !taskForm.employeeEmail.trim()
    ) {
      alert("Title, employee name and email are required.");
      return;
    }

    updateTask({
      id: taskForm.id,
      title: taskForm.title,
      description: taskForm.description || "",
      employeeName: taskForm.employeeName,
      employeeEmail: taskForm.employeeEmail,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || null,
      status: taskForm.status, // keep status
    });

    closeModal();
  };

  const askDeleteTask = (task) => {
    setDeleteTarget({ id: task.id, title: task.title });
  };

  const confirmDeleteTask = () => {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    setDeleteTarget(null);
  };

  const cancelDeleteTask = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <AdminTasksHeader
        total={tasks.length}
        filteredCount={filteredTasks.length}
        onAdd={openAddModal}
      />

      {/* Filters */}
      <AdminTasksFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {/* Scrollable area, fixed max height */}
          <div className="overflow-y-auto max-h-[480px]">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Employee</th>
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
                    colSpan={6}
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
                      <span className="text-xs text-gray-400">
                        Created {formatCreatedAt(task.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {task.employeeName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {task.employeeEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={priorityBadge(task.priority)}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusBadge(task.status)}>
                      {displayStatusLabel(task.status)}
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
                    <div className="inline-flex items-center gap-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        onClick={() => openViewModal(task)}
                      >
                        View
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                        onClick={() => askDeleteTask(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
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
                <span className="text-xs text-gray-400">
                  Created {formatCreatedAt(task.createdAt)}
                </span>
              </div>
              <span className={statusBadge(task.status)}>
                {displayStatusLabel(task.status)}
              </span>
            </div>

            {/* Employee + priority + due */}
            <div className="flex items-start justify-between gap-3 text-xs text-gray-700">
              <div className="flex-1">
                <p className="text-[11px] font-medium text-gray-500 uppercase">
                  Employee
                </p>
                <p className="mt-0.5 text-gray-900">
                  {task.employeeName}
                </p>
                <p className="text-[11px] text-gray-400">
                  {task.employeeEmail}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase">
                    Priority
                  </p>
                  <span className={priorityBadge(task.priority)}>
                    {task.priority}
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
            </div>

            {/* Description preview */}
            <div className="text-xs text-gray-700">
              <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                Description
              </p>
              <p className="line-clamp-2">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100"
                onClick={() => openViewModal(task)}
              >
                View
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                onClick={() => askDeleteTask(task)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      {selectedTask && modalType === "view" && (
        <TaskModalView
          task={selectedTask}
          onClose={closeModal}
          onEdit={openEditModal}
          priorityBadge={priorityBadge}
          statusBadge={statusBadge}
          displayStatusLabel={displayStatusLabel}
        />
      )}

      {/* Add task modal */}
      {modalType === "add" && (
        <TaskModalForm
          mode = "add"
          taskForm={taskForm}
          onChange={handleTaskFormChange}
          onSubmit={handleAddTaskSubmit}
          onClose={closeModal}
        />
      )}

      {modalType === "edit" && (
        <TaskModalForm
          mode = "edit"
          taskForm={taskForm}
          onChange={handleTaskFormChange}
          onSubmit={handleEditTaskSubmit}
          onClose={closeModal}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <TaskModalWrapper title="Delete task" onClose={cancelDeleteTask}>
          <div className="space-y-4 text-sm">
            <p className="text-gray-700">
              Are you sure you want to delete this task?
            </p>
            <p className="text-gray-900 font-medium">
              {deleteTarget.title}
            </p>
            <p className="text-xs text-gray-400">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={cancelDeleteTask}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDeleteTask}
              >
                Delete task
              </button>
            </div>
          </div>
        </TaskModalWrapper>
      )}
      <CantEditTaskModal
        open={showCantEdit}
        onClose={() => setShowCantEdit(false)}
      />
    </div>  
  );
}

export default AdminTasks;
