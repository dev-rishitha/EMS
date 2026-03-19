// ems-client/src/pages/admin/AdminNotifications.jsx
import { useState, useMemo } from "react";
import { useNotifications } from "../../context/NotificationContext";

const FILTERS = {
  ALL: "all",
  UNREAD: "unread",
  SYSTEM: "system",
  ACTIVITY: "activity",
};

function AdminNotifications() {
  const { notifications = [], unreadCount, markAllRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);

  const filteredNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];

    switch (activeFilter) {
      case FILTERS.UNREAD:
        return notifications.filter((n) => !n.isRead);
      case FILTERS.SYSTEM:
        return notifications.filter((n) => n.type === "system");
      case FILTERS.ACTIVITY:
        return notifications.filter((n) => n.type === "activity");
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            View recent updates across employees, tasks, and attendance.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <button
          onClick={() => setActiveFilter(FILTERS.ALL)}
          className={`px-3 py-1.5 rounded-full ${
            activeFilter === FILTERS.ALL
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter(FILTERS.UNREAD)}
          className={`px-3 py-1.5 rounded-full ${
            activeFilter === FILTERS.UNREAD
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveFilter(FILTERS.SYSTEM)}
          className={`px-3 py-1.5 rounded-full ${
            activeFilter === FILTERS.SYSTEM
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          System
        </button>
        <button
          onClick={() => setActiveFilter(FILTERS.ACTIVITY)}
          className={`px-3 py-1.5 rounded-full ${
            activeFilter === FILTERS.ACTIVITY
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          Activity
        </button>
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-gray-800">
            You’re all caught up.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            No notifications to show right now.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <ul className="space-y-3 max-h-[520px] overflow-y-auto">
            {filteredNotifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl px-3 py-2 border text-[11px] sm:text-xs
                  ${
                    n.isRead
                      ? "border-gray-100 bg-white"
                      : "border-blue-100 bg-blue-50"
                  }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-[11px] sm:text-xs">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {n.createdAt &&
                        new Date(n.createdAt).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="inline-flex items-center rounded-full bg-blue-600 text-white text-[10px] px-2 py-0.5">
                      New
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600">
                  {n.message}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default AdminNotifications;
