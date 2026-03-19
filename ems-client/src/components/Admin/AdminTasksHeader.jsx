function AdminTasksHeader({ total, filteredCount, onAdd }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
            All tasks
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track tasks by employee, status and priority.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-gray-400">
          {filteredCount} of {total} tasks
        </span>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={onAdd}
        >
          <span className="text-lg leading-none">＋</span>
          <span className="hidden sm:inline">Add task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </div>
  );
}

export default AdminTasksHeader;
