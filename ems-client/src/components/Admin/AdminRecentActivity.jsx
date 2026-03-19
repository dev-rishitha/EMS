import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return formatDateTime(value);
};

function AdminRecentActivity() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // load same activity data as Activity page
  useEffect(() => {
    let isMounted = true;

    async function loadLog() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/activity-log");
        if (!res.ok) throw new Error("Failed to load activity log");
        const data = await res.json();

        if (!isMounted) return;

        const items = data.map((item) => ({
          id: item.id,
          category: item.category,
          action: item.action,
          title: item.summary,
          message: item.details || item.summary,
          time: timeAgo(item.createdAt),
          fullTime: formatDateTime(item.createdAt),
          type:
            item.category === "task"
              ? item.action === "task_status_changed"
                ? "success"
                : "info"
              : item.category === "leave"
              ? item.action === "leave_requested"
                ? "warning"
                : "info"
              : item.category === "attendance"
              ? "warning"
              : "info",
          timestamp: new Date(item.createdAt).getTime(),
        }));

        // newest first
        items.sort((a, b) => b.timestamp - a.timestamp);
        setActivity(items);
      } catch (err) {
        console.error("Recent activity load error:", err);
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

  // pick last 30 days, top 3 – optional; you can skip the 30‑days filter if you like
  const recentActivities = useMemo(() => {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const withinRange = activity.filter(
      (a) => now - a.timestamp <= THIRTY_DAYS
    );

    return withinRange.slice(0, 3);
  }, [activity]);

  const typeStyles = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Recent activity
          </h3>
          <p className="text-[11px] text-gray-400">
            Last 30 days · latest 3 items
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/activities")}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          View all →
        </button>
      </div>

      {/* List */}
      <div className="flex-1 mt-2 max-h-44 overflow-y-auto pr-1 space-y-3">
        {loading ? (
          <p className="text-xs text-gray-400">Loading activity...</p>
        ) : recentActivities.length === 0 ? (
          <p className="text-xs text-gray-400">
            No recent activity in the last 30 days.
          </p>
        ) : (
          recentActivities.map((item, index) => (
            <div key={item.id} className="flex gap-3">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    typeStyles[item.type] || typeStyles.info
                  }`}
                />
                {index !== recentActivities.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-gray-200" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-700">
                  {item.message}
                </p>
                <span
                  className="text-[11px] text-gray-400"
                  title={item.fullTime}
                >
                  {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminRecentActivity;
