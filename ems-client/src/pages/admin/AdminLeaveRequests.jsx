import React, { useMemo, useState } from "react";
import { useLeave } from "../../context/LeaveContext";

function SidePanel({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function AdminLeaveRequests() {
  const { leaveRequests, updateLeaveStatus } = useLeave();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [panelMode, setPanelMode] = useState("view"); // "view" | "approve" | "reject"
  const [managerNote, setManagerNote] = useState("");

  // Summary stats
  const stats = useMemo(() => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(
      (r) => r.status === "Pending" || r.status === "pending"
    ).length;
    const approved = leaveRequests.filter(
      (r) => r.status === "Approved" || r.status === "approved"
    ).length;
    const rejected = leaveRequests.filter(
      (r) => r.status === "Rejected" || r.status === "rejected"
    ).length;
    return { total, pending, approved, rejected };
  }, [leaveRequests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase();
    return leaveRequests.filter((req) => {
      const statusLower = req.status.toLowerCase();
      const matchesSearch =
        req.employeeName.toLowerCase().includes(term) ||
        req.employeeEmail.toLowerCase().includes(term) ||
        req.type.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : statusLower === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, search, statusFilter]);

  const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateRange = (start, end) => {
  if (!start && !end) return "—";
  if (!start) return formatDate(end);
  if (!end) return formatDate(start);
  return `${formatDate(start)} → ${formatDate(end)}`;
};

  const statusChip = (status) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    const s = status.toLowerCase();
    if (s === "pending")
      return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
    if (s === "approved")
      return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`;
    if (s === "rejected")
      return `${base} bg-rose-50 text-rose-700 border border-rose-100`;
    return `${base} bg-gray-50 text-gray-600 border border-gray-100`;
  };

  const statusLabel = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const openPanel = (req, mode) => {
    setSelectedRequest(req);
    setPanelMode(mode);
    setManagerNote(mode === "view" ? req.managerNote || "" : "");
  };

  const closePanel = () => {
    setSelectedRequest(null);
    setPanelMode("view");
    setManagerNote("");
  };

  // Approve / reject using context (no fetch)
  const handleDecision = () => {
    if (!selectedRequest) return;
    const newStatus = panelMode === "approve" ? "Approved" : "Rejected";

    updateLeaveStatus({
      id: selectedRequest.id,
      status: newStatus, // "Approved" or "Rejected"
      managerNote: managerNote.trim(),
    });

    closePanel();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Leave requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Card view of all employee leave activity.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Total
          </span>
          <span className="mt-2 text-2xl font-semibold text-gray-900">
            {stats.total}
          </span>
          <span className="mt-1 text-xs text-gray-400">All requests</span>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            Pending
          </span>
          <span className="mt-2 text-2xl font-semibold text-blue-600">
            {stats.pending}
          </span>
          <span className="mt-1 text-xs text-blue-400">
            Awaiting decision
          </span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-2xl px-4 py-3 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
            Approved
          </span>
          <span className="mt-2 text-2xl font-semibold text-emerald-600">
            {stats.approved}
          </span>
          <span className="mt-1 text-xs text-emerald-400">
            Upcoming &amp; past
          </span>
        </div>
        <div className="bg-white border border-rose-100 rounded-2xl px-4 py-3 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-rose-600 uppercase tracking-wide">
            Rejected
          </span>
          <span className="mt-2 text-2xl font-semibold text-rose-600">
            {stats.rejected}
          </span>
          <span className="mt-1 text-xs text-rose-400">Not approved</span>
        </div>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
            🔍
          </span>
          <input
            className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-72"
            placeholder="Search employee, email, type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["all", "pending", "approved", "rejected"].map((value) => (
            <button
              key={value}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-full border ${
                statusFilter === value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setStatusFilter(value)}
            >
              {value === "all"
                ? "All"
                : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRequests.length === 0 && (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl px-5 py-6 text-center text-gray-500 shadow-sm">
            No leave requests match your filters.
          </div>
        )}

        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3 hover:border-blue-200 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {req.employeeName}
                </p>
                <p className="text-xs text-gray-400">
                  {req.employeeEmail}
                </p>
              </div>
              <span className={statusChip(req.status)}>
                {statusLabel(req.status)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <div>
                <p className="font-medium text-gray-500 uppercase text-[11px]">
                  Type
                </p>
                <p className="mt-0.5 text-gray-800">{req.type} leave</p>
              </div>
              <div>
                <p className="font-medium text-gray-500 uppercase text-[11px]">
                  Dates
                </p>
                <p className="mt-0.5 text-gray-800">
                  {formatDateRange(req.startDate, req.endDate)}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500 uppercase text-[11px]">
                  Days
                </p>
                <p className="mt-0.5 text-gray-800">{req.days}</p>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-500 uppercase text-[11px] mb-1">
                Reason
              </p>
              <p className="line-clamp-2">{req.reason}</p>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-400">
                Requested {formatDate(req.requestedOn)}
              </span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-xs rounded-full border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  onClick={() => openPanel(req, "view")}
                >
                  View
                </button>
                {req.status === "Pending" && (
                  <>
                    <button
                      className="px-3 py-1.5 text-xs rounded-full border border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      onClick={() => openPanel(req, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs rounded-full border border-rose-100 text-rose-700 bg-rose-50 hover:bg-rose-100"
                      onClick={() => openPanel(req, "reject")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side panel for view/approve/reject */}
      {selectedRequest && (
        <SidePanel
          title={
            panelMode === "view"
              ? "Leave request"
              : panelMode === "approve"
              ? "Approve leave request"
              : "Reject leave request"
          }
          onClose={closePanel}
        >
          <div className="space-y-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  Employee
                </p>
                <p className="text-gray-900 font-semibold">
                  {selectedRequest.employeeName}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedRequest.employeeEmail}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={statusChip(selectedRequest.status)}>
                  {statusLabel(selectedRequest.status)}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {selectedRequest.type} leave
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  From
                </p>
                <p className="text-gray-800">
                 {formatDate(selectedRequest.startDate)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  To
                </p>
                <p className="text-gray-800">
                  {formatDate(selectedRequest.endDate)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  Days
                </p>
                <p className="text-gray-800">{selectedRequest.days}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                Reason
              </p>
              <p className="text-gray-700 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>

            {panelMode === "view" && selectedRequest.managerNote && (
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  Manager note
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedRequest.managerNote}
                </p>
              </div>
            )}

            {panelMode !== "view" && (
              <div>
                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                  {panelMode === "approve"
                    ? "Optional note to employee"
                    : "Rejection reason (optional)"}
                </p>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[90px]"
                  placeholder={
                    panelMode === "approve"
                      ? "Example: Approved. Enjoy your leave!"
                      : "Example: We have a critical release on these dates."
                  }
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={closePanel}
              >
                {panelMode === "view" ? "Close" : "Cancel"}
              </button>
              {panelMode !== "view" && (
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-xl text-white ${
                    panelMode === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                  onClick={handleDecision}
                >
                  {panelMode === "approve"
                    ? "Approve request"
                    : "Reject request"}
                </button>
              )}
            </div>
          </div>
        </SidePanel>
      )}
    </div>
  );
}

export default AdminLeaveRequests;
