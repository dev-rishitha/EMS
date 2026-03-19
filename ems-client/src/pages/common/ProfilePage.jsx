import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function ProfilePage() {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    // Admin-controlled (read-only in UI)
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "employee",
    department: user?.department || "",
    status: user?.status || "active",

    // Employee-controlled personal data
    phone: user?.phone || "",
    address: user?.address || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    maritalStatus: user?.maritalStatus || "",
    location: user?.location || "",

    // Employee-controlled employment details
    joinDate: user?.joinDate || "",
    qualification: user?.qualification || "",
    team: user?.team || "",
    employeeNumber: user?.employeeNumber || "",
    employmentType: user?.employmentType || "",
    employmentStatus: user?.employmentStatus || user?.status || "",
  });

  const [editing, setEditing] = useState(false);

  const initial = form.name?.charAt(0)?.toUpperCase() || "U";
  const roleLabel =
    form.role === "admin"
      ? "Administrator"
      : form.role === "manager"
      ? "Manager"
      : "Employee";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    login({
      ...user,
      // keep admin-controlled values from auth
      role: user.role,
      department: user.department,
      status: user.status,

      // allow employee to refine these
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      gender: form.gender,
      dob: form.dob,
      maritalStatus: form.maritalStatus,
      location: form.location,
      joinDate: form.joinDate,
      qualification: form.qualification,
      team: form.team,
      employeeNumber: form.employeeNumber,
      employmentType: form.employmentType,
      employmentStatus: form.employmentStatus || user.status,
    });

    setEditing(false);
  };

//   const statusColor =
//     form.status === "active"
//       ? "bg-emerald-50 text-emerald-700 border-emerald-100"
//       : form.status === "inactive"
//       ? "bg-gray-50 text-gray-600 border-gray-200"
//       : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top gradient header */}

    <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
        <div>
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
            Profile
        </h1>
        <p className="text-sm text-gray-500">
            View and update your personal and employment information.
        </p>
        </div>
    </div>

    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
        <div className="relative">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-600/90 flex items-center justify-center text-lg sm:text-xl font-semibold text-white shadow-sm">
            {initial}
            </div>
        </div>
        <div>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
            {form.name || "Your profile"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
            {roleLabel}{" "}
            {form.department
                ? `· ${form.department}`
                : ""}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
            {form.email || "Email not set"}
            </p>
        </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
            form.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : form.status === "inactive"
                ? "bg-gray-50 text-gray-600 border-gray-200"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
        >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {form.status === "active"
            ? "Active account"
            : form.status || "Status"}
        </span>
        <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
            {editing ? "Cancel" : "Edit profile"}
        </button>
        </div>
    </section>
    </div>


      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal information card */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                Personal information
              </h2>
              <p className="text-xs text-gray-500">
                Basic details that help your organization contact you.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={form.name}
                editable={editing}
                onChange={(v) => handleChange("name", v)}
              />
              <Field
                label="Email"
                value={form.email}
                editable={editing}
                onChange={(v) => handleChange("email", v)}
              />
            </div>

            {/* Phone + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Phone"
                value={form.phone}
                editable={editing}
                onChange={(v) => handleChange("phone", v)}
              />
              <Field
                label="Location"
                value={form.location}
                editable={editing}
                onChange={(v) => handleChange("location", v)}
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-4">
              <TextAreaField
                label="Address"
                value={form.address}
                editable={editing}
                onChange={(v) => handleChange("address", v)}
              />
            </div>

            {/* Row: gender / dob / marital status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField
                label="Gender"
                value={form.gender}
                editable={editing}
                options={[
                  { value: "", label: "Select" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(v) => handleChange("gender", v)}
              />
              <InputField
                label="Date of birth"
                type="date"
                value={form.dob}
                editable={editing}
                onChange={(v) => handleChange("dob", v)}
              />
              <SelectField
                label="Marital status"
                value={form.maritalStatus}
                editable={editing}
                options={[
                  { value: "", label: "Select" },
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                  { value: "divorced", label: "Divorced" },
                  { value: "widowed", label: "Widowed" },
                ]}
                onChange={(v) => handleChange("maritalStatus", v)}
              />
            </div>
          </div>
        </section>

        {/* Employment information card */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                Employment information
              </h2>
              <p className="text-xs text-gray-500">
                Organization details configured by HR and your manager.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100">
              Some fields are read-only
            </span>
          </div>

          <div className="space-y-5">
            {/* Department + Role (read-only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Department"
                value={form.department}
                editable={false}
              />
              <Field
                label="Role"
                value={roleLabel}
                editable={false}
              />
            </div>

            {/* Join date + Qualification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Join date"
                type="date"
                value={form.joinDate}
                editable={editing}
                onChange={(v) => handleChange("joinDate", v)}
              />
              <Field
                label="Qualification"
                value={form.qualification}
                editable={editing}
                onChange={(v) => handleChange("qualification", v)}
              />
            </div>

            {/* Team / Employee no / Employment type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Team"
                value={form.team}
                editable={editing}
                onChange={(v) => handleChange("team", v)}
              />
              <Field
                label="Employee number"
                value={form.employeeNumber}
                editable={editing}
                onChange={(v) => handleChange("employeeNumber", v)}
              />
              <Field
                label="Employment type"
                value={form.employmentType}
                editable={editing}
                onChange={(v) => handleChange("employmentType", v)}
              />
            </div>

            {/* Employment status / Account status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Employment status"
                value={form.employmentStatus || form.status}
                editable={editing}
                onChange={(v) => handleChange("employmentStatus", v)}
              />
              <Field
                label="Account status"
                value={form.status}
                editable={false}
              />
            </div>
          </div>

          {editing && (
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Save changes
              </button>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}

/* Generic read-only / text field */
function Field({ label, value, editable, onChange }) {
  const content =
    value || value === 0 ? (
      value
    ) : (
      <span className="text-gray-400">Not set</span>
    );

  if (!editable) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        <p className="text-sm text-gray-900">{content}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900/80"
      />
    </div>
  );
}

/* Textarea field */
function TextAreaField({ label, value, editable, onChange }) {
  if (!editable) {
    return <Field label={label} value={value} editable={false} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900/80"
      />
    </div>
  );
}

/* Input with type (for date, etc.) */
function InputField({ label, type = "text", value, editable, onChange }) {
  if (!editable) {
    return <Field label={label} value={value} editable={false} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900/80"
      />
    </div>
  );
}

/* Select field */
function SelectField({ label, value, editable, options, onChange }) {
  if (!editable) {
    return <Field label={label} value={value} editable={false} />;
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900/80"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProfilePage;
