// TaskListNumbers.jsx
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

function TaskListNumbers({ taskStats }) {
  const items = [
    {
      key: "new",
      label: "New",
      color: "bg-blue-50 text-blue-700",
      accent: "bg-blue-100 text-blue-700",
      icon: ArrowTrendingUpIcon,
      chip: "New tasks",
    },
    {
      key: "accepted",
      label: "In Progress",
      color: "bg-amber-50 text-amber-700",
      accent: "bg-amber-100 text-amber-700",
      icon: ArrowTrendingUpIcon,
      chip: "Ongoing",
    },
    {
      key: "completed",
      label: "Completed",
      color: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-100 text-emerald-700",
      icon: ArrowTrendingUpIcon,
      chip: "Done",
    },
    {
      key: "failed",
      label: "Blocked",
      color: "bg-rose-50 text-rose-700",
      accent: "bg-rose-100 text-rose-700",
      icon: ArrowTrendingDownIcon,
      chip: "Needs attention",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => {
        const value = taskStats[item.key] ?? 0;
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/80
                       px-3 py-3 sm:px-4 sm:py-3 shadow-sm flex flex-col gap-1.5
                       hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all"
          >
            {/* Top row: label + small icon pill */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${item.accent}`}
              >
                <Icon className="h-3 w-3" />
              </span>
            </div>

            {/* Metric */}
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
              {value}
            </p>

            {/* Tag */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${item.color}`}
            >
              {item.chip}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default TaskListNumbers;
