function EmployeeDetailsModal({ employee, open, onClose }) {
  if (!open || !employee) return null;

  // fallback values so UI doesn't break until you add these fields
  const {
    name,
    email,
    phone,
    address,
    gender,
    dob,
    maritalStatus,
    joinDate,
    qualification,
    role,
    designation,
    team,
    employeeNumber,
    employmentType,
    employmentStatus,
    department,
  } = employee;

  const display = (val) => val || <span className="text-gray-400">—</span>;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Employee details
            </h2>
            <p className="text-xs text-gray-500">
              ID: {employee.id}
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-sm">
          {/* Personal Data */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Personal data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>
                <p className="text-[11px] text-gray-500">Name</p>
                <p className="mt-0.5 text-gray-900">{display(name)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Email</p>
                <p className="mt-0.5 text-gray-900">{display(email)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Phone</p>
                <p className="mt-0.5 text-gray-900">{display(phone)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Gender</p>
                <p className="mt-0.5 text-gray-900">{display(gender)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Date of birth</p>
                <p className="mt-0.5 text-gray-900">{display(dob)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Marital status</p>
                <p className="mt-0.5 text-gray-900">{display(maritalStatus)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] text-gray-500">Address</p>
                <p className="mt-0.5 text-gray-900">{display(address)}</p>
              </div>
            </div>
          </section>

          {/* Employment Details */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Employment details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>
                <p className="text-[11px] text-gray-500">Join date</p>
                <p className="mt-0.5 text-gray-900">{display(joinDate)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Qualification</p>
                <p className="mt-0.5 text-gray-900">{display(qualification)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Role</p>
                <p className="mt-0.5 text-gray-900 capitalize">
                  {display(role)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Designation</p>
                <p className="mt-0.5 text-gray-900">{display(designation)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Team</p>
                <p className="mt-0.5 text-gray-900">{display(team)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Employee number</p>
                <p className="mt-0.5 text-gray-900">
                  {display(employeeNumber)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Employment type</p>
                <p className="mt-0.5 text-gray-900">{display(employmentType)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Employment status</p>
                <p className="mt-0.5 text-gray-900">
                  {display(employmentStatus || employee.status)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Department</p>
                <p className="mt-0.5 text-gray-900">{display(department)}</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetailsModal;
