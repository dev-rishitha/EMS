// ems-client/src/pages/admin/AdminHelp.jsx
import { adminFaq } from "../../config/adminFaq";

function AdminHelp() {
  return (
    <>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Help & Support
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Find answers, browse guides, or reach out to the support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: quick help */}
        <section className="lg:col-span-2 space-y-4">
          {/* FAQ card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-gray-500">
                  Quick answers to common questions about EMS.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              {adminFaq.map((item) => (
                <div key={item.q}>
                  <p className="font-medium text-gray-900">{item.q}</p>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
              <div>
                <p className="font-medium text-gray-900">
                  How are tasks assigned to employees?
                </p>
                <p className="text-gray-600">
                  Use the Tasks section to create a task, then select an employee
                  or team and set due dates and priority.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  How is leave approval handled?
                </p>
                <p className="text-gray-600">
                  Employees submit requests from their portal, and admins can
                  approve or reject them from the Leave Requests page.
                </p>
              </div>
            </div>
          </div>

          {/* Guides card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
              Quick Guides
            </h2>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
              <li className="flex items-center justify-between">
                <span>Getting started with EMS Admin</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span>Managing employees & roles</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span>Task and attendance best practices</span>
                <button className="text-[11px] sm:text-xs text-blue-600 hover:underline">
                  View guide
                </button>
              </li>
            </ul>
          </div>
        </section>

        {/* Right: contact support */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm h-full">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
            Contact Support
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Send us a message if you’re facing an issue or need help with a
            specific feature.
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
                <option>General question</option>
                <option>Employees & roles</option>
                <option>Tasks & assignments</option>
                <option>Attendance & leave</option>
                <option>Technical issue / bug</option>
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
              Submit request
            </button>

            <p className="text-[11px] text-gray-400">
              Typical response time: within 24 hours.
            </p>
          </form>
        </section>
      </div>
    </>
  );
}

export default AdminHelp;
