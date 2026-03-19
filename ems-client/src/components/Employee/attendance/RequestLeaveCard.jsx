import LeaveStatusBadge from "./LeaveStatusBadge";
import LeaveListItem from "./LeaveListItem";

const Card = ({ children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
    {children}
  </section>
);

const SectionHeader = ({ title, subtitle }) => (
  <header className="px-4 sm:px-5 py-3 border-b border-gray-100">
    <h2 className="text-sm sm:text-base font-semibold text-gray-800">
      {title}
    </h2>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </header>
);

function RequestLeaveCard({
  leaveForm,
  onChange,
  onSubmit,
  isSubmittingLeave,
  myLeaveRequests,
  recentMyLeaveRequests,
  showAllLeaves,
  setShowAllLeaves,
}) {
  return (
    <Card className="flex-1 flex flex-col">
      <SectionHeader
        title="Request Leave"
        subtitle="Submit a new leave request to your manager."
      />
      <div className="flex-1 px-4 sm:px-5 py-4 space-y-5">
        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Leave type
            </label>
            <select
              name="type"
              value={leaveForm.type}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
              <option value="Comp Off">Comp Off</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["startDate", "endDate"].map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {field === "startDate" ? "Start date" : "End date"}
                </label>
                <input
                  type="date"
                  name={field}
                  value={leaveForm[field]}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={leaveForm.reason}
              onChange={onChange}
              rows={3}
              placeholder="Explain why you need leave..."
              className="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmittingLeave}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmittingLeave ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>

        {/* 0 or 1 request */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700">
              My recent leave requests
            </h3>
            {myLeaveRequests.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllLeaves(true)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                View all
              </button>
            )}
          </div>

          {recentMyLeaveRequests.length === 0 ? (
            <p className="text-xs text-gray-500">
              No leave requests submitted yet.
            </p>
          ) : (
            <ul className="space-y-2 max-h-24 overflow-y-auto text-xs">
              {recentMyLeaveRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-lg px-2 py-1.5"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {r.type} ({r.days} day{r.days > 1 ? "s" : ""})
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {r.startDate} → {r.endDate}
                    </p>
                  </div>
                  <div className="mt-1 sm:mt-0 text-right">
                    <LeaveStatusBadge status={r.status} />
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Requested on {r.requestedOn}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Side panel */}
      {showAllLeaves && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAllLeaves(false)}
          />
          <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-900">
                All leave requests
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-lg"
                onClick={() => setShowAllLeaves(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 text-sm">
              {myLeaveRequests.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No leave requests submitted yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {myLeaveRequests.map((r) => (
                    <LeaveListItem key={r.id} r={r} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default RequestLeaveCard;
