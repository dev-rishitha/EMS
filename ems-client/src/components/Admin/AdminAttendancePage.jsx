// ems-client/src/components/Admin/AdminAttendancePage.jsx
import { useEffect, useMemo, useState } from "react";

// helper: normalize any date/ISO into "YYYY-MM-DD"
function toYMD(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// helper: "2026-02-26T18:30:00.000Z" or "2026-02-26" -> "26 Feb 2026"
function formatDatePretty(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/attendance");
        const data = await res.json();
        setAttendance(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load attendance for admin page", err);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

//   const todayKey = useMemo(() => {
//     const d = new Date();
//     return [
//       d.getFullYear(),
//       String(d.getMonth() + 1).padStart(2, "0"),
//       String(d.getDate()).padStart(2, "0"),
//     ].join("-");
//   }, []);

  const summary = useMemo(() => {
  // today key "YYYY-MM-DD"
    const todayKey = toYMD(new Date());

    // start of current week (Mon)
    const weekStart = new Date();
    const day = weekStart.getDay(); // 0=Sun..6=Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    let todayPresent = 0;
    let todayAbsent = 0;
    let weekPresent = 0;
    let weekAbsent = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    attendance.forEach((rec) => {
        const status = (rec.status || "").toLowerCase();
        const ymd = toYMD(rec.date);
        if (!ymd) return;

        const d = new Date(rec.date);
        const isToday = ymd === todayKey;
        const isThisWeek = d >= weekStart && d <= new Date();

        if (status === "present") {
            totalPresent += 1;
            if (isToday) todayPresent += 1;
            if (isThisWeek) weekPresent += 1;
        }
        if (status === "absent") {
            totalAbsent += 1;
            if (isToday) todayAbsent += 1;
            if (isThisWeek) weekAbsent += 1;
        }
    });

    return {
        todayPresent,
        todayAbsent,
        weekPresent,
        weekAbsent,
        totalPresent,
        totalAbsent,
    };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    if (selectedStatus === "all") return attendance;
    return attendance.filter(
      (rec) => (rec.status || "").toLowerCase() === selectedStatus
    );
  }, [attendance, selectedStatus]);

  if (loading) {
    return (
      <div className="py-10 text-sm text-slate-500">
        Loading attendance records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">
            Attendance overview
          </h1>
          <p className="text-sm text-slate-500">
            Monitor presence trends and review daily records.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
            label="Today"
            value={`${summary.todayPresent} present`}
            description={`${summary.todayAbsent} absent today`}
        />
        <SummaryCard
            label="This week"
            value={`${summary.weekPresent} present`}
            description={`${summary.weekAbsent} absent this week`}
        />
        <SummaryCard
            label="Overall attendance"
            value={`${summary.totalPresent + summary.totalAbsent} records`}
            description={`${summary.totalPresent} present • ${summary.totalAbsent} absent`}
            tone="warning"
        />
        </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-200/70">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Attendance records
          </h2>
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="present">Present only</option>
            <option value="absent">Absent only</option>
          </select>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/80">
                <Th>Date</Th>
                <Th>Employee</Th>
                <Th>Employee ID</Th>
                <Th>Status</Th>
                <Th>Check-in</Th>
                <Th>Check-out</Th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-6 text-center text-xs text-slate-400"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => (
                  <tr
                    key={`${rec.employeeId}-${rec.date}-${idx}`}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }
                  >
                    <Td>{formatDatePretty(rec.date)}</Td>
                    <Td>{rec.employeeName || "-"}</Td>
                    <Td>{rec.employeeId || "-"}</Td>
                    <Td>
                      <StatusPill status={rec.status} />
                    </Td>
                    <Td>{rec.checkIn || "-"}</Td>
                    <Td>{rec.checkOut || "-"}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, description, tone = "default" }) {
  const toneClasses =
    tone === "warning"
      ? "bg-white border-amber-200 text-amber-900"
      : "bg-white border-slate-200 text-slate-900";

  return (
    <div
      className={`rounded-2xl border ${toneClasses} px-4 py-3 flex flex-col gap-1 shadow-sm`}
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.14em] font-medium text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-5 py-2.5 text-sm text-slate-700 align-middle">
      {children}
    </td>
  );
}

function StatusPill({ status }) {
  const normalized = (status || "").toLowerCase();
  const isPresent = normalized === "present";
  const styles = isPresent
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-rose-50 text-rose-700 border-rose-100";

  const label = isPresent ? "Present" : "Absent";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default AdminAttendancePage;
