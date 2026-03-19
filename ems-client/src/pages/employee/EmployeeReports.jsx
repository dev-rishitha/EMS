// ems-client/src/pages/employee/EmployeeReports.jsx
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";

function EmployeeReports() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const myTasks = tasks.filter((t) => t.employeeEmail === user?.email);

    const total = myTasks.length;
    const completed = myTasks.filter((t) => t.status === "completed").length;
    const inProgress = myTasks.filter((t) => t.status === "in_progress").length;
    const pending = myTasks.filter((t) => t.status === "pending").length;

    const high = myTasks.filter((t) => t.priority === "high").length;
    const medium = myTasks.filter((t) => t.priority === "medium").length;
    const low = myTasks.filter((t) => t.priority === "low").length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // deadlines: how many tasks have a dueDate and are pending / in_progress
    const upcoming = myTasks.filter(
      (t) =>
        (t.status === "pending" || t.status === "in_progress") && t.dueDate
    ).length;

    // simple “attendance score” placeholder (you can plug real data later)
    const attendanceScore = 92;

    return {
      total,
      completed,
      inProgress,
      pending,
      high,
      medium,
      low,
      completionRate,
      upcoming,
      attendanceScore,
    };
  }, [tasks, user?.email]);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">
          My reports
        </h1>
        <p className="text-sm text-slate-500">
          A visual overview of your productivity, tasks, deadlines and
          attendance.
        </p>
      </div>

      {/* Two-column layout of 5 sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My productivity */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 flex flex-col gap-3">
          <Header label="My productivity" />
          <p className="text-xs text-slate-500">
            How much work you&apos;ve completed compared to what&apos;s assigned.
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold text-slate-900">
                {stats.completionRate}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.completed} of {stats.total || 0} tasks completed
              </p>
            </div>
          </div>

          <ProgressBar value={stats.completionRate} />

          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
            <span>
              • In progress:{" "}
              <span className="font-semibold text-slate-800">
                {stats.inProgress}
              </span>
            </span>
            <span>
              • Pending:{" "}
              <span className="font-semibold text-slate-800">
                {stats.pending}
              </span>
            </span>
          </div>
        </section>

        {/* My task performance */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 flex flex-col gap-3">
          <Header label="My task performance" />
          <p className="text-xs text-slate-500">
            Status overview of your current tasks.
          </p>

          <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
            <MiniStat
              label="Completed"
              value={stats.completed}
              tone="positive"
            />
            <MiniStat
              label="In progress"
              value={stats.inProgress}
              tone="info"
            />
            <MiniStat label="Pending" value={stats.pending} tone="neutral" />
          </div>
        </section>

        {/* My deadlines */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 flex flex-col gap-3">
          <Header label="My deadlines" />
          <p className="text-xs text-slate-500">
            Tasks that have due dates and are not finished yet.
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">
              {stats.upcoming}
            </p>
            <p className="text-xs text-slate-500">upcoming tasks</p>
          </div>

          <p className="text-[11px] text-slate-500">
            Try to complete high priority tasks first to avoid missing
            deadlines.
          </p>
        </section>

        {/* My attendance */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 flex flex-col gap-3">
          <Header label="My attendance" />
          <p className="text-xs text-slate-500">
            Quick snapshot of your check-in consistency.
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold text-slate-900">
                {stats.attendanceScore}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Attendance score (sample)
              </p>
            </div>
          </div>

          <ProgressBar value={stats.attendanceScore} tone="secondary" />

          <p className="mt-2 text-[11px] text-slate-500">
            This can later be connected to your real attendance records.
          </p>
        </section>

        {/* Where I can improve */}
        <section className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4 flex flex-col gap-3">
          <Header label="Where I can improve" />
          <p className="text-xs text-slate-600">
            Simple suggestions based on your current stats.
          </p>

          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <HintCard
              title="Reduce pending tasks"
              condition={stats.pending > 0}
              text="Pick one pending task and move it into in-progress today."
              fallback="You have no pending tasks. Great job!"
            />
            <HintCard
              title="Focus high priority"
              condition={stats.high > 0}
              text="Finish one high priority task before working on low priority items."
              fallback="No high priority tasks right now."
            />
            <HintCard
              title="Improve completion rate"
              condition={stats.completionRate < 80}
              text="Aim to complete at least one more task this week."
              fallback="Your completion rate already looks strong."
            />
          </ul>
        </section>
      </div>
    </div>
  );
}

/* Small visual helpers */

function Header({ label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-sky-500 to-emerald-500" />
      <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
    </div>
  );
}

function ProgressBar({ value, tone = "primary" }) {
  const barColor =
    tone === "secondary"
      ? "from-emerald-500 to-sky-500"
      : "from-sky-500 to-emerald-500";

  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${barColor}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function MiniStat({ label, value, tone = "neutral" }) {
  const colors =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
      : tone === "info"
      ? "bg-sky-50 text-sky-800 border-sky-100"
      : "bg-slate-50 text-slate-800 border-slate-100";

  return (
    <div className={`rounded-xl border px-3 py-2 ${colors}`}>
      <p className="text-[11px] uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function HintCard({ title, condition, text, fallback }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white px-3 py-3 flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-[0.14em]">
        {title}
      </p>
      <p className="text-xs text-slate-600">
        {condition ? text : fallback}
      </p>
    </li>
  );
}

export default EmployeeReports;
