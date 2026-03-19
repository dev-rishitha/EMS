import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:8000";

function AdminSettings() {
  const { user, login } = useAuth();

  // const [form, setForm] = useState({
  //   name: user?.name || "Admin User",
  //   email: user?.email || "admin@gmail.com",
  //   notifications: true,
  //   darkMode: false,
  //   orgName: "Your Company",
  //   orgTimezone: "Asia/Kolkata",
  // });

  // const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    emailNotifications: true,
    weeklySummary: false,
    inAppSounds: false,
    orgName: "",
    orgTimezone: "Asia/Kolkata",
    workingDays: "Monday – Friday",
  });

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(""); // "account" | "preferences" | "organization"
  const [toast, setToast] = useState({ open: false, title: "", message: "" });
  const [error, setError] = useState("");

  // Load initial settings from backend
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/settings`, {
          credentials: "include",
        });

        const text = await res.text();
        if (!res.ok){
          throw new Error(`Failed to load settings (${res.status})`);
        } 
        let data;
        try {
          data = JSON.parse(text);
        } catch{
          throw new Error("Server returned invalid JSON for /api/settings");
        }
        if (!isMounted) return;

        setForm({
          name: data.user.name,
          email: data.user.email,
          emailNotifications: data.preferences.emailNotifications,
          weeklySummary: data.preferences.weeklySummary,
          inAppSounds: data.preferences.inAppSounds,
          orgName: data.organization.orgName,
          orgTimezone: data.organization.orgTimezone,
          workingDays: data.organization.workingDays || "Monday – Friday",
        });

        // Also sync AuthContext so Header uses latest name/email
        login({
          ...user,
          name: data.user.name,
          email: data.user.email,
          org: data.organization,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load settings. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const showToast = (title, message) => {
    setToast({ open: true, title, message });
    setTimeout(() => setToast({ open: false, title: "", message: "" }), 2500);
  };

  // const handleSaveAccount = (e) => {
  //   e.preventDefault();
  //   login({ ...user, name: form.name, email: form.email });
  //   setSuccess("Account settings updated.");
  // };

  // const handleSavePreferences = (e) => {
  //   e.preventDefault();
  //   setSuccess("Preferences saved.");
  // };

  // const handleSaveOrganization = (e) => {
  //   e.preventDefault();
  //   setSuccess("Organization settings updated.");
  // };

    const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      setSavingKey("account");
      setError("");

      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          emailNotifications: form.emailNotifications,
          weeklySummary: form.weeklySummary,
          inAppSounds: form.inAppSounds,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Keep header/user context in sync
      login({
        ...user,
        name: form.name,
        email: form.email,
      });

      showToast("Account settings saved", "Your profile details were updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save account settings.");
    } finally {
      setSavingKey("");
    }
  };

    const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSavingKey("preferences");
      setError("");

      const res = await fetch(`${API_BASE}/api/settings/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          emailNotifications: form.emailNotifications,
          weeklySummary: form.weeklySummary,
          inAppSounds: form.inAppSounds,
        }),
      });

      if (!res.ok) throw new Error("Failed to save preferences");

      showToast("Preferences saved", "Your notification preferences were updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setSavingKey("");
    }
  };

    const handleSaveOrganization = async (e) => {
    e.preventDefault();
    try {
      setSavingKey("organization");
      setError("");

      const res = await fetch(`${API_BASE}/api/settings/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orgName: form.orgName,
          orgTimezone: form.orgTimezone,
          workingDays: form.workingDays,
        }),
      });

      if (!res.ok) throw new Error("Failed to save organization");

      // Optionally update user.org in context
      login({
        ...user,
        org: {
          ...(user.org || {}),
          orgName: form.orgName,
          orgTimezone: form.orgTimezone,
          workingDays: form.workingDays,
        },
      });

      showToast("Organization settings saved", "Company details were updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save organization settings.");
    } finally {
      setSavingKey("");
    }
  };

     if (loading) {
    return <p className="text-sm text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="max-w-4xl">
      {/* Page heading */}
      <div className="mb-5 sm:mb-7">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your account, preferences and organization details.
        </p>
      </div>

      {/* Toast */}
      {toast.open && (
        <div className="fixed z-50 bottom-4 right-4 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg flex items-start gap-3">
          <span className="mt-0.5 text-lg">✅</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-emerald-800">{toast.title}</p>
            {toast.message && (
              <p className="mt-0.5 text-[11px] text-emerald-700">{toast.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast({ open: false, title: "", message: "" })}
            className="text-[11px] text-emerald-700 hover:text-emerald-900"
          >
            Close
          </button>
        </div>
      )}

      {/* Error inline */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs sm:text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {/* Account */}
        <SettingsCard
          title="Account"
          description="Update your basic account details."
        >
          <form onSubmit={handleSaveAccount} className="space-y-4 text-sm">
            <SettingsRow
              label="Full name"
              hint="Shown in the header and profile."
            >
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </SettingsRow>

            <SettingsRow
              label="Email address"
              hint="Used for login and notifications."
            >
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </SettingsRow>

            <div className="pt-3 flex justify-end">
              <PrimaryButton type="submit" disabled={savingKey === "account"}>
                {savingKey === "account" ? "Saving..." : "Save account"}
              </PrimaryButton>
            </div>
          </form>
        </SettingsCard>

        {/* Preferences (no dark mode) */}
        <SettingsCard
          title="Preferences"
          description="Control notifications and app behaviour."
        >
          <form onSubmit={handleSavePreferences} className="space-y-4 text-sm">
            <SettingsRow
              label="Email notifications"
              hint="Get emails for important events like leave requests and task updates."
            >
              <Toggle
                id="emailNotifications"
                name="emailNotifications"
                checked={form.emailNotifications}
                onChange={handleChange}
              />
            </SettingsRow>

            <SettingsRow
              label="Weekly summary"
              hint="Receive a weekly HR summary by email."
            >
              <Toggle
                id="weeklySummary"
                name="weeklySummary"
                checked={form.weeklySummary}
                onChange={handleChange}
              />
            </SettingsRow>

            <SettingsRow
              label="In-app sounds"
              hint="Play a sound when a new notification arrives."
            >
              <Toggle
                id="inAppSounds"
                name="inAppSounds"
                checked={form.inAppSounds}
                onChange={handleChange}
              />
            </SettingsRow>

            <div className="pt-3 flex justify-end">
              <SecondaryButton
                type="submit"
                disabled={savingKey === "preferences"}
              >
                {savingKey === "preferences" ? "Saving..." : "Save preferences"}
              </SecondaryButton>
            </div>
          </form>
        </SettingsCard>

        {/* Organization (admin) */}
        <SettingsCard
          title="Organization"
          description="Basic details for your company in EMS."
        >
          <form onSubmit={handleSaveOrganization} className="space-y-4 text-sm">
            <SettingsRow
              label="Organization name"
              hint="Shown across the EMS application."
            >
              <Input
                type="text"
                name="orgName"
                value={form.orgName}
                onChange={handleChange}
              />
            </SettingsRow>

            <SettingsRow
              label="Default timezone"
              hint="Used for attendance and leave timings."
            >
              <Select
                name="orgTimezone"
                value={form.orgTimezone}
                onChange={handleChange}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </Select>
            </SettingsRow>

            <SettingsRow
              label="Working days"
              hint="Informational setting for your HR team."
            >
              <Input
                type="text"
                name="workingDays"
                value={form.workingDays}
                onChange={handleChange}
              />
            </SettingsRow>

            <div className="pt-3 flex justify-end">
              <SecondaryButton
                type="submit"
                disabled={savingKey === "organization"}
              >
                {savingKey === "organization" ? "Saving..." : "Save organization"}
              </SecondaryButton>
            </div>
          </form>
        </SettingsCard>
      </div>
    </div>
  );
}

/* Layout helpers: one row = label (left) + content (right) */

function SettingsCard({ title, description, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <div className="px-4 sm:px-5 py-4 sm:py-5">{children}</div>
    </section>
  );
}

function SettingsRow({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
      {/* Left: label + hint */}
      <div className="sm:w-1/3">
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-gray-500">
            {hint}
          </p>
        )}
      </div>

      {/* Right: control */}
      <div className="sm:flex-1">{children}</div>
    </div>
  );
}

/* Basic controls */

function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  );
}

function Toggle({ id, name, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-xs text-gray-600">Enable</span>
    </label>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </button>
  );
}

export default AdminSettings;
