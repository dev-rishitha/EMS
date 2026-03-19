import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function EmployeeSettings() {
  const { user } = useAuth();

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    emailTaskUpdates: true,
    emailAnnouncements: true,
    pushReminders: true,
    showCompletedInMyTasks: true,
    workHoursStart: "09:30",
    workHoursEnd: "18:30",
    timezone: "Asia/Kolkata",
  });

  const handleToggle = (field) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Later: Save to backend or context
    alert("Settings saved.");
  };

  const displayName = user?.name || "Employee";

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Customize your account, preferences, and notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Account */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Account
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Basic information about your account.
            </p>
          </div>
          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4 text-sm">
            <SettingsRow
              label="Name"
              description="This is the name visible to your manager and team."
            >
              <span className="text-gray-900">{displayName}</span>
            </SettingsRow>
            <SettingsRow
              label="Email"
              description="Your primary login and notification email."
            >
              <span className="text-gray-900">
                {user?.email || "not-set@example.com"}
              </span>
            </SettingsRow>
          </div>
        </section>

        {/* Section: Preferences */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Preferences
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Control how the app looks and behaves for you.
            </p>
          </div>
          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4 text-sm">
            <SettingsRow
              label="Theme"
              description="Switch between light and dark appearance."
            >
              <select
                value={preferences.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System default</option>
              </select>
            </SettingsRow>

            <SettingsRow
              label="Language"
              description="Choose your preferred language for the interface."
            >
              <select
                value={preferences.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </SettingsRow>

            <SettingsRow
              label="Working hours"
              description="Used for reminders and upcoming deadline indicators."
            >
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.workHoursStart}
                  onChange={(e) =>
                    handleChange("workHoursStart", e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="time"
                  value={preferences.workHoursEnd}
                  onChange={(e) =>
                    handleChange("workHoursEnd", e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </SettingsRow>

            <SettingsRow
              label="Time zone"
              description="Make sure this matches your local working time."
            >
              <select
                value={preferences.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </SettingsRow>
          </div>
        </section>

        {/* Section: Notifications */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Choose when you want to be notified.
            </p>
          </div>
          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4 text-sm">
            <SettingsRow
              label="Task updates"
              description="Get email notifications when your task status changes."
            >
              <Toggle
                enabled={preferences.emailTaskUpdates}
                onChange={() => handleToggle("emailTaskUpdates")}
              />
            </SettingsRow>

            <SettingsRow
              label="Announcements"
              description="Get important announcements from HR or Admin in your inbox."
            >
              <Toggle
                enabled={preferences.emailAnnouncements}
                onChange={() => handleToggle("emailAnnouncements")}
              />
            </SettingsRow>

            <SettingsRow
              label="Reminders"
              description="Show in-app reminders for upcoming deadlines."
            >
              <Toggle
                enabled={preferences.pushReminders}
                onChange={() => handleToggle("pushReminders")}
              />
            </SettingsRow>

            <SettingsRow
              label="Completed tasks"
              description="Show completed tasks in your My Tasks view."
            >
              <Toggle
                enabled={preferences.showCompletedInMyTasks}
                onChange={() => handleToggle("showCompletedInMyTasks")}
              />
            </SettingsRow>
          </div>
        </section>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}

/* Helper components */

function SettingsRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
      <div className="sm:w-1/3">
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {description && (
          <p className="text-[11px] text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="sm:flex-1 sm:text-right">
        {children}
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default EmployeeSettings;
