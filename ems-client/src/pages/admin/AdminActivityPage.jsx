// ems-client/src/pages/admin/AdminActivityPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  // Fallback to formatted date for old events
  return formatDateTime(value);
};

const PAGE_SIZE = 25;

function AdminActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/employee";

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | tasks | leaves | attendance
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    async function loadLog() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/activity-log");
        if (!res.ok) throw new Error("Failed to load activity log");
        const data = await res.json();

        if (!isMounted) return;

        // Normalize items for UI
        const items = data.map((item) => ({
          id: item.id,
          category: item.category,
          action: item.action,
          title: item.summary,
          message: item.details || item.summary,
          time: timeAgo(item.createdAt),          // for display
          fullTime: formatDateTime(item.createdAt), // for tooltip
          timestamp: new Date(item.createdAt).getTime(),
        }));

        // newest first (API already sorted desc, but keep it explicit)
        items.sort((a, b) => b.timestamp - a.timestamp);

        setActivity(items);
      } catch (err) {
        console.error("Activity log load error:", err);
        if (isMounted) setActivity([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLog();
    return () => {
      isMounted = false;
    };
  }, []);

  // reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  // Filter by category for Tasks / Leaves / Attendance
  const filtered = useMemo(() => {
    if (filter === "tasks") return activity.filter((a) => a.category === "task");
    if (filter === "leaves") return activity.filter((a) => a.category === "leave");
    if (filter === "attendance") return activity.filter((a) => a.category === "attendance");
      return activity;
    }, [activity, filter]);

  // Map categories to visual types
  const getType = (item) => {
    if (item.category === "task") {
      if (item.action === "task_status_changed") return "success";
      if (item.action === "task_created") return "info";
      return "info";
    }
    if (item.category === "leave") {
      if (item.action === "leave_requested") return "warning";
      return "info";
    }
    if (item.category === "attendance") return "warning";
    if (item.category === "system") return "info";
    return "info";
  };

  const notifications = filtered.map((item) => ({
    ...item,
    type: getType(item),
  }));

  const visibleNotifications = notifications.slice(0, visibleCount);

  const badgeStyles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };

  const iconStyles = {
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    info: "bg-blue-500/10 text-blue-600",
  };

  const iconSymbol = {
    success: "✔",
    warning: "!",
    info: "ℹ",
  };

  const total = notifications.length;
  const successCount = notifications.filter((n) => n.type === "success").length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const infoCount = notifications.filter((n) => n.type === "info").length;

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
      {/* Top header row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            Activity log
          </h1>
          <p className="text-xs text-gray-500">
            Chronological history of tasks, leaves, and attendance.
          </p>
        </div>
        <button
          onClick={() => navigate(dashboardPath)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Back to dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("tasks")}
          className={`px-3 py-1.5 rounded-full ${
            filter === "tasks"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setFilter("leaves")}
          className={`px-3 py-1.5 rounded-full ${
            filter === "leaves"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          Leaves
        </button>
        <button
          onClick={() => setFilter("attendance")}
          className={`px-3 py-1.5 rounded-full ${
            filter === "attendance"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          Attendance
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Timeline list */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Timeline
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[11px] text-gray-600 border border-gray-200">
              {loading ? "Loading..." : `${total} activities`}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading activity...</p>
          ) : total === 0 ? (
            <p className="text-sm text-gray-400">
              No activity to show yet.
            </p>
          ) : (
            <div className="relative max-h-[70vh] overflow-y-auto pr-1">
              {/* Thin neutral rail */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200 pointer-events-none" />

              <div className="space-y-3">
                {visibleNotifications.map((item) => (
                  <article
                    key={item.id}
                    className="relative flex items-start gap-3 sm:gap-4
                              transition-all duration-150
                              hover:bg-slate-50 hover:shadow-sm hover:border-slate-200"
                  >
                    {/* Dot */}
                    <div className="relative z-10 mt-1">
                      <div
                        className={`h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                          item.type === "success"
                            ? "bg-emerald-500"
                            : item.type === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      />
                    </div>

                    {/* Bubble */}
                    <div className="flex-1 min-w-0 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <span className="text-[11px] text-gray-400"
                          title={item.fullTime}
                        >
                          {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-gray-700">
                        {item.message}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          badgeStyles[item.type] || badgeStyles.info
                        }`}
                      >
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                            iconStyles[item.type] || iconStyles.info
                          }`}
                        >
                          {iconSymbol[item.type] || iconSymbol.info}
                        </span>
                        {item.category === "task"
                          ? "Task"
                          : item.category === "leave"
                          ? "Leave"
                          : item.category === "attendance"
                          ? "Attendance"
                          : "System"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {visibleCount < notifications.length && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT: Quick stats panel */}
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 flex flex-col gap-4 transition-all duration-150 hover:shadow-md">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Activity summary
            </h2>
            <p className="text-xs text-gray-500">
              Snapshot of recent events.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-xl border border-blue-100 bg-white p-3 transition-all duration-150 hover:shadow-sm hover:bg-blue-50">
              <p className="text-[11px] font-medium text-blue-700 uppercase tracking-wide">
                Info
              </p>
              <p className="mt-1 text-lg font-semibold text-blue-900">
                {infoCount}
              </p>
              <p className="mt-0.5 text-[11px] text-blue-700/80">
                General updates
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-white p-3 transition-all duration-150 hover:shadow-sm hover:bg-emerald-50">
              <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
                Success
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-900">
                {successCount}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700/80">
                Completed actions
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-white p-3 col-span-2 transition-all duration-150 hover:shadow-sm hover:bg-amber-50">
              <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
                Attention
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-900">
                {warningCount}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700/80">
                Pending or critical items
              </p>
            </div>
          </div>

          <div className="mt-auto text-[11px] text-gray-400">
            Tip: Use this log to trace who did what and when across the system.
          </div>
        </aside>
      </div>
    </main>
  );
}

export default AdminActivityPage;
