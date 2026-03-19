// ems-client/src/components/Admin/AdminTaskStats.jsx
import {
  UsersIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useTasks } from "../../context/TaskContext";

function AdminTaskStats({ employees = [], leaves = [] }) {
  const { tasks } = useTasks();

  console.log(
    "TASKS DEBUG",
    tasks.map((t) => ({
      id: t.id,
      status: t.status,
      updatedAt: t.updatedAt,
      updated_at: t.updated_at,
    }))
  );

  // --- Employee-based stats ---
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (e) => e.status === "active"
  ).length;
  const onLeaveEmployees = employees.filter(
    (e) => e.status === "on_leave"
  ).length;

  // --- Leave requests ---
  // const totalLeaves = leaves.length;

  // this month total leave requests (by requested_on or created_at)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // common helper
  const isInCurrentMonth = (r) => {
    const dateStr =
      r.requested_on || r.requestedOn || r.created_at || r.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const leavesThisMonth = leaves.filter(isInCurrentMonth).length;

  const pendingLeaves = leaves.filter(
    (r) => r.status?.toLowerCase() === "pending" && isInCurrentMonth(r)
  ).length;
  const approvedLeaves = leaves.filter(
    (r) => r.status?.toLowerCase() === "approved" && isInCurrentMonth(r)
  ).length;

  // --- Task-based stats (for overdue + weekly performance) ---
  const today = startOfDay(new Date());
  const overdue = tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (t.status === "completed" || t.status === "failed") return false;
    const d = startOfDay(new Date(t.dueDate));
    return d < today;
  }).length;

  const { last7DaysCount, last7DaysLabel, weeklyPct } =
    computeWeeklyPerformance(tasks);

  const cards = [
    {
      label: "Employees",
      value: totalEmployees,
      sub:
        totalEmployees === 0
          ? "No employees yet"
          : `${activeEmployees} active · ${onLeaveEmployees} on leave`,
      icon: UsersIcon,
      ring: "border-indigo-100",
      bg: "from-indigo-50 to-white",
      valueColor: "text-indigo-700",
    },
    {
      label: "Leave requests",
      value: leavesThisMonth, // show this month total
      sub:
        leavesThisMonth === 0
          ? "No leave requests this month"
          : `${leavesThisMonth} this month · ${pendingLeaves} pending · ${approvedLeaves} approved`,
      icon: CalendarDaysIcon,
      ring: "border-amber-100",
      bg: "from-amber-50 to-white",
      valueColor: "text-amber-700",
    },
    {
      label: "Overdue tasks",
      value: overdue,
      sub: "Past due & open",
      icon: ExclamationTriangleIcon,
      ring: "border-rose-100",
      bg: "from-rose-50 to-white",
      valueColor: "text-rose-700",
    },
    {
      label: "Weekly performance",
      value: `${weeklyPct}%`,
      sub: last7DaysLabel,
      icon: ChartBarIcon,
      ring: "border-blue-100",
      bg: "from-blue-50 to-white",
      valueColor: "text-blue-700",
      isWeekly: true,
      extra: { last7DaysCount },
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-2xl border ${stat.ring} bg-gradient-to-br ${stat.bg}
                       px-3 py-3 sm:px-4 sm:py-4 flex flex-col justify-between shadow-sm`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium tracking-[0.14em] text-gray-500 uppercase">
                {stat.label}
              </p>
              {stat.icon && (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 border border-white shadow-sm">
                  <stat.icon className="h-4 w-4 text-gray-500" />
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-xl sm:text-2xl font-semibold ${stat.valueColor}`}
              >
                {stat.value}
              </span>
            </div>

            {stat.isWeekly ? (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-gray-500">
                  {stat.extra.last7DaysCount} task
                  {stat.extra.last7DaysCount !== 1 ? "s" : ""} updated ·{" "}
                  {stat.sub}
                </p>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
                    style={{ width: weeklyPct + "%" }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/* Helpers stay the same */

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function computeWeeklyPerformance(tasks) {
  const today = startOfDay(new Date());
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const inRange = (date) => {
    if (!date) return false;
    const d = startOfDay(new Date(date));
    return d >= sevenDaysAgo && d <= today;
  };

  const completedTasks = tasks.filter(
    (t) => t.status === "completed"
  );
  const total = completedTasks.length || 1;

  let count = 0;
  completedTasks.forEach((t) => {
    if (inRange(t.updatedAt)) count += 1;
  });

  const label = `${formatShortDate(sevenDaysAgo)} – ${formatShortDate(today)}`;
  const weeklyPct = Math.round((count / total) * 100);

  return { last7DaysCount: count, last7DaysLabel: label, weeklyPct };
}

function formatShortDate(d) {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default AdminTaskStats;
