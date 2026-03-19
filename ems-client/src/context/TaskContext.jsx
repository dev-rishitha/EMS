/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotifications } from "./NotificationContext";
import { useAuth } from "./AuthContext";

const TaskContext = createContext(null);
const API_BASE = "http://localhost:8000/api";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const [employeeNewTaskCount, setEmployeeNewTaskCount] = useState(0);

  const userEmail = user?.email?.toLowerCase() || "";

  // 1) Fetch tasks whenever logged‑in user changes (login/logout)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/tasks`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);

        const normalizeStatus = (raw) => {
          if (!raw) return "pending";
          const s = String(raw).toLowerCase().trim();

          // Map DB strings to frontend canonical
          if (s === "todo") return "pending";
          if (s === "done") return "completed";

          // Already in frontend style?
          if (["pending", "in_progress", "completed"].includes(s)) return s;

          return "pending";
        };

        const normalized = data.map((t) => ({
          ...t,
          status: normalizeStatus(t.status),
          updatedAt: t.updatedAt || t.updated_at || null,
          createdAt: t.createdAt || t.created_at || null,
        }));

        setTasks(normalized);

        if (userEmail) {
          const unseen = normalized.filter(
            (t) =>
              t.employeeEmail?.toLowerCase() === userEmail &&
              t.is_seen_by_employee === 0
          ).length;
          setEmployeeNewTaskCount(unseen);
        } else {
          setEmployeeNewTaskCount(0);
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Could not load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userEmail]);

  const resetEmployeeNewTaskCount = async () => {
    if (!userEmail) return;
    setEmployeeNewTaskCount(0);

    try {
      await fetch(`${API_BASE}/tasks/mark-seen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeEmail: userEmail }),
      });
    } catch (err) {
      console.error("Failed to mark tasks as seen", err);
    }
  };

  // Admin creates task
  const createTask = async (taskInput) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskInput.title,
          description: taskInput.description || "",
          employeeName: taskInput.employeeName,
          employeeEmail: taskInput.employeeEmail,
          dueDate: taskInput.dueDate || null,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Create task failed:", res.status, errBody);
        throw new Error("Failed to create task");
      }

      const created = await res.json();
      setTasks((prev) => [...prev, created]);

      // optional: notification for admin / current user
      if (
        created.employeeEmail &&
        created.employeeEmail.toLowerCase() === userEmail
      ) {
        addNotification({
          type: "task_assigned",
          title: "New task assigned",
          message: `A new task "${created.title}" has been assigned to you.`,
        });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Could not create task. Check server console for details.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  const updateTask = async (updated) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updated.title,
          description: updated.description || "",
          employeeName: updated.employeeName,   // ✅ send name
          employeeEmail: updated.employeeEmail,
          status: updated.status || "pending",
          priority: updated.priority,          // if backend supports it
          dueDate: updated.dueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");
      const saved = await res.json();

      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  const updateTaskStatusFromEmployee = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update task status");

      // const updatedAt = new Date().toISOString();
      // setTasks((prev) => {
      //   const updatedTasks = prev.map((t) =>
      //     t.id === id ? { ...t, status, updatedAt } : t
      //   );

      //   const updatedTask = updatedTasks.find((t) => t.id === id);
      //           if (status === "completed" && updatedTask) {
      //             addNotification({
      //               type: "task_completed",
      //               title: "Task completed",
      //               message: `${updatedTask.employeeName || "Employee"} completed "${
      //                 updatedTask.title
      //               }".`,
      //             });
      //           }

      // ✅ get updated task with updatedAt from backend
      const saved = await res.json();

      setTasks((prev) => {
        const updatedTasks = prev.map((t) =>
          t.id === saved.id ? saved : t
        );

        if (status === "completed") {
          const updatedTask = saved;
          addNotification({
            type: "task_completed",
            title: "Task completed",
            message: `${updatedTask.employeeName || "Employee"} completed "${
              updatedTask.title
            }".`,
          });
        }
        return updatedTasks;
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      throw err;
    }
  };
          
  const value = {
    tasks,
    loading,
    error,
    createTask,
    deleteTask,
    updateTask,
    updateTaskStatusFromEmployee,
    employeeNewTaskCount,
    resetEmployeeNewTaskCount,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);