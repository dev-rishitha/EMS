// ems-client/src/pages/employee/EmployeeNotifications.jsx
import { useEffect, useState, useMemo } from "react";

function EmployeeNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/employee-notifications");
        const data = await res.json();
        console.log("EMPLOYEE NOTIFICATIONS:", data); // ← add this
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load notifications", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("http://localhost:8000/api/employee-notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  if (loading) {
    return (
      <div className="py-10 text-sm text-slate-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">
            Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Stay up to date with tasks, approvals, and company updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200/70">
        {filteredNotifications.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            You&apos;re all caught up. No notifications right now.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {filteredNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ notification }) {
  const { title, message, createdAt, isRead, type } = notification;

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const typeLabel =
    type === "task"
      ? "Task"
      : type === "leave"
      ? "Leave"
      : type === "system"
      ? "System"
      : "Update";

  const badgeClasses =
    type === "task"
      ? "bg-sky-50 text-sky-700 border-sky-100"
      : type === "leave"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <li
      className={`px-4 sm:px-5 py-3 flex items-start gap-3 ${
        !isRead ? "bg-sky-50/50" : "bg-white"
      }`}
    >
      {/* unread dot */}
      <div className="pt-2">
        {!isRead && (
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
        )}
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {title}
          </h3>
          <span className="text-[11px] text-slate-400 whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          {message}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${badgeClasses}`}
          >
            {typeLabel}
          </span>
          {isRead ? (
            <span className="text-[10px] text-slate-400">Read</span>
          ) : (
            <span className="text-[10px] text-sky-600 font-medium">
              New
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default EmployeeNotification;
