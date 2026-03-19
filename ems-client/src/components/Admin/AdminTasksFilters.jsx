function AdminTasksFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter
}) {
  const statusPill = (value) =>
    `px-3 py-1.5 text-xs rounded-full border ${
      statusFilter === value
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    }`;

  const priorityPill = (value) =>
    `px-3 py-1.5 text-xs rounded-full border ${
      priorityFilter === value
        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 flex flex-wrap items-center gap-4 shadow-sm">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
          🔍
        </span>
        <input
          className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search task, employee, email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">
          Status
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={statusPill("all")} onClick={() => setStatusFilter("all")}>
            All
          </button>
          <button type="button" className={statusPill("pending")} onClick={() => setStatusFilter("pending")}>
            Not started
          </button>
          <button
            type="button"
            className={statusPill("in_progress")}
            onClick={() => setStatusFilter("in_progress")}
          >
            In progress
          </button>
          <button
            type="button"
            className={statusPill("completed")}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">
          Priority
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={priorityPill("all")} onClick={() => setPriorityFilter("all")}>
            All
          </button>
          <button type="button" className={priorityPill("high")} onClick={() => setPriorityFilter("high")}>
            High
          </button>
          <button type="button" className={priorityPill("medium")} onClick={() => setPriorityFilter("medium")}>
            Medium
          </button>
          <button type="button" className={priorityPill("low")} onClick={() => setPriorityFilter("low")}>
            Low
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTasksFilters;
