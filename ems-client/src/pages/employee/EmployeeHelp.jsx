// ems-client/src/pages/employee/EmployeeHelp.jsx

function EmployeeHelp() {
  return (
    <>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Help & Support
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Get help with your tasks, attendance, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: self-help content */}
        <section className="lg:col-span-2 space-y-4">
          {/* FAQ card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-gray-500">
                  Quick answers to common questions for employees.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div>
                <p className="font-medium text-gray-900">
                  How do I see my assigned tasks?
                </p>
                <p className="text-gray-600">
                  Go to the Work Assignments page from the sidebar to see your
                  current tasks, due dates, and statuses.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  How can I request leave?
                </p>
                <p className="text-gray-600">
                  Open the Time & Absences page, choose the date range, select
                  leave type, and submit your request for approval.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  Where can I view my attendance history?
                </p>
                <p className="text-gray-600">
                  Your recent check-ins, check-outs, and leave days are shown in
                  the Time & Absences section under Attendance details.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  How do I update my profile details?
                </p>
                <p className="text-gray-600">
                  Use the Profile page to update basic information and the
                  Settings page to manage password and preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Short guides card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
              Quick Guides
            </h2>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
              <li className="flex items-center justify-between">
                <span>Getting started with your dashboard</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span>Best practices for completing tasks</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span>Understanding attendance and leave status</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
            </ul>
          </div>
        </section>

        {/* Right: contact admin / HR */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm h-full">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
            Contact Support
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            If you can’t resolve an issue on your own, send a request to the
            admin or HR team.
          </p>

          <form className="space-y-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Short summary of your issue"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option>Task-related issue</option>
                <option>Attendance / leave</option>
                <option>Profile / account</option>
                <option>Technical problem</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                placeholder="Describe what you need help with..."
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Send request
            </button>

            <p className="text-[11px] text-gray-400">
              Your request will be sent to the admin team. You may receive a
              reply by email or inside this portal.
            </p>
          </form>
        </section>
      </div>
    </>
  );
}

export default EmployeeHelp;
