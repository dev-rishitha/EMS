import React, { useState, useMemo, useEffect } from "react";
import EmployeeDetailsModal from "./EmployeeDetailsModal"; 

// const INITIAL_EMPLOYEES = [
//   { id: 1, name: "John Doe", email: "john@example.com", role: "employee", department: "HR", status: "active" },
//   { id: 2, name: "Jane Admin", email: "jane@example.com", role: "admin", department: "IT", status: "active" }
// ];

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function AdminEmployees() {
  const [detailsEmployee, setDetailsEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "employee",
    department: "",
    status: "active"
  });
  const [modalType, setModalType] = useState(null); // "add" | "edit" | "delete"
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        // backend does not have 'status' yet, so default it
        const withStatus = data.map((emp) => ({
          ...emp,
          status: "active",
        }));
        setEmployees(withStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setLoading(false);
      });
  }, []);  

  const filteredEmployees = useMemo(() => {
    const t = search.toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(t) ||
        e.email.toLowerCase().includes(t) ||
        (e.department || "").toLowerCase().includes(t);

      const matchesStatus =
        statusFilter === "all" ? true : e.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const openAddModal = () => {
    setForm({
      id: Date.now(),
      name: "",
      email: "",
      role: "employee",
      department: "",
      status: "active"
    });
    setSelectedEmployee(null);
    setModalType("add");
  };

  const openEditModal = (emp) => {
    setForm(emp);
    setSelectedEmployee(emp);
    setModalType("edit");
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedEmployee(null);
    setForm({
      id: null,
      name: "",
      email: "",
      role: "employee",
      department: "",
      status: "active"
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // CREATE + UPDATE via API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and Email are required");
      return;
    }

    try {
      if (modalType === "edit" && form.id != null) {
        // UPDATE
        const res = await fetch(
          `http://localhost:8000/api/employees/${form.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              department: form.department,
              role: form.role,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update employee");
        }

        setEmployees((prev) =>
          prev.map((e) =>
            e.id === form.id ? { ...form } : e
          )
        );
      } else if (modalType === "add") {
        // CREATE
        const res = await fetch("http://localhost:8000/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            department: form.department,
            role: form.role,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create employee");
        }

        const created = await res.json();
        setEmployees((prev) => [
          ...prev,
          { ...created, status: "active" },
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // DELETE via API
  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/employees/${selectedEmployee.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete employee");
      }

      setEmployees((prev) =>
        prev.filter((e) => e.id !== selectedEmployee.id)
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  const statusBadge = (status) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    if (status === "active")
      return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`;
    if (status === "on_leave")
      return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
    return `${base} bg-gray-50 text-gray-600 border border-gray-100`;
  };

  if (loading) {
    return <div className="p-4">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage employee profiles, roles and status.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          <span className="text-lg leading-none">＋</span>
          <span className="hidden sm:inline">Add employee</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-55 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
            🔍
          </span>
          <input
            className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search name, email or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* New status filter */}
        <select
          className="text-xs sm:text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On leave</option>
          <option value="inactive">Inactive</option>
        </select>

        <span className="text-[11px] text-gray-400">
          {filteredEmployees.length} of {employees.length} employees
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={6}
                  >
                    No employees found.
                  </td>
                </tr>
              )}
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="font-medium text-gray-900 text-left hover:underline"
                        onClick={() => {
                          setDetailsEmployee(emp);
                          setShowDetails(true);
                        }}
                      >
                        {emp.name}
                      </button>
                      <span className="text-xs text-gray-400">
                        ID: {emp.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">{emp.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {emp.department || (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusBadge(emp.status)}>
                      {emp.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                      onClick={() => openDeleteModal(emp)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredEmployees.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-5 text-center text-gray-500 shadow-sm">
            No employees found.
          </div>
        )}
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-sm font-semibold text-gray-900 hover:underline cursor-pointer"
                  onClick={() => {
                    setDetailsEmployee(emp);
                    setShowDetails(true);
                  }}
                >
                  {emp.name}
                </p>
                <p className="text-xs text-gray-400">{emp.email}</p>
              </div>
              <span className={statusBadge(emp.status)}>
                {emp.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase">
                  Role
                </p>
                <p className="mt-0.5 capitalize">{emp.role}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase">
                  Department
                </p>
                <p className="mt-0.5">
                  {emp.department || (
                    <span className="text-gray-400">—</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => openEditModal(emp)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                onClick={() => openDeleteModal(emp)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit modal */}
      {(modalType === "add" || modalType === "edit") && (
        <Modal
          title={modalType === "add" ? "Add employee" : "Edit employee"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Full name
              </label>
              <input
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Role
                </label>
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Department
                </label>
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Status
                </label>
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={form.status.replace("_", " ")}
                  readOnly
                />
                <p className="text-[11px] text-gray-400">
                  Status cannot be changed here.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {modalType === "add" ? "Create employee" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete modal */}
      {modalType === "delete" && selectedEmployee && (
        <Modal
          title="Delete employee"
          onClose={closeModal}
        >
          <div className="space-y-4 text-sm">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedEmployee.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
      <EmployeeDetailsModal
        employee={detailsEmployee}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setDetailsEmployee(null);
        }}
      />
    </div>
  );
}

export default AdminEmployees;
