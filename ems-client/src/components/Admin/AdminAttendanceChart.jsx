// ems-client/src/components/Admin/AdminAttendanceChart.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AdminAttendanceChart() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/attendance"); // admin: all
        const data = await res.json();
        setAttendance(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load attendance for chart", err);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const weeklyData = useMemo(() => {
    const base = DAYS.map((day, idx) => ({
      day,
      present: 0,
      absent: 0,
      idx,
    }));

    if (!attendance || attendance.length === 0) return base;

    attendance.forEach((rec) => {
      if (!rec.date) return;
      const d = new Date(rec.date);
      if (Number.isNaN(d.getTime())) return;

      const jsDay = d.getDay(); // 0=Sun..6=Sat
      const weekdayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6

      const bucket = base[weekdayIndex];
      if (!bucket) return;

      const status = (rec.status || "").toLowerCase();
      if (status === "present") bucket.present += 1;
      if (status === "absent") bucket.absent += 1;
    });

    return base;
  }, [attendance]);

  const maxValue =
    weeklyData.reduce(
      (max, d) => Math.max(max, d.present + d.absent),
      0
    ) || 1;

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-sky-100 p-4 sm:p-5 shadow-sm h-full flex items-center justify-center text-xs text-slate-500">
        Loading attendance chart...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Weekly attendance
          </h3>
          <p className="text-xs text-slate-500">
            Present vs absent across all employees
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/attendance")}
          className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
        >
          View details →
        </button>
      </div>

      {/* Bars */}
      <div className="mt-1 flex gap-3 sm:gap-4 items-end flex-1">
        {weeklyData.map((d) => {
          const total = d.present + d.absent;
          const height = (total / maxValue) * 100;

          const presentHeight = total === 0 ? 0 : (d.present / total) * height;
          const absentHeight = total === 0 ? 0 : (d.absent / total) * height;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="relative w-5 sm:w-7 h-28 sm:h-32 flex flex-col-reverse rounded-full bg-white overflow-hidden border border-sky-100 shadow-sm">
                {/* Absent */}
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400"
                  style={{ height: `${absentHeight}%` }}
                />
                {/* Present */}
                <div
                  className="w-full bg-gradient-to-t from-sky-500 to-cyan-400"
                  style={{ height: `${presentHeight}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                {d.day}
              </span>
              <span className="text-[10px] text-slate-400">
                {d.present} / {d.absent}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminAttendanceChart;
