import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../../context/TaskContext";
import { useLeave } from "../../context/LeaveContext";

import AdminTaskStats from "../Admin/AdminTaskStats";
import AdminTaskTable from "../Admin/AdminTaskTable";
import AdminRecentActivity from "../Admin/AdminRecentActivity";
import AdminAttendanceChart from "../Admin/AdminAttendanceChart";

function AdminDashboard() {
  const { tasks } = useTasks();
  const [employees, setEmployees] = useState([]);
  const { leaveRequests } = useLeave();
  const [setLoadingEmployees] = useState(true);

  const sortedDashboardTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        const withStatus = data.map((emp) => ({
          ...emp,
          status: emp.status || "active",
        }));
        setEmployees(withStatus);
        setLoadingEmployees(false);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setLoadingEmployees(false);
      });
  }, []);

  return (
    <>
      {/* Top stat cards */}
      <AdminTaskStats employees={employees} leaves={leaveRequests}/>

      {/* Main grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
        {/* LEFT: Task management */}
        <section className="lg:col-span-2 flex flex-col bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Task Management
              </h2>
              <p className="text-xs text-gray-500">
                Review, track, and create new tasks.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/tasks", {
                  state: { openCreate: true },
                })
              }
              className="inline-flex items-center justify-center
                         bg-blue-600 text-white text-xs sm:text-sm font-medium
                         px-3 sm:px-4 py-2 rounded-lg
                         hover:bg-blue-700 transition
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              + Create Task
            </button>
          </div>

          {/* Scrollable table area */}
          <div className="mt-3 flex-1 min-h-[260px]">
            <div className="h-full">
              <AdminTaskTable tasks={sortedDashboardTasks} />
            </div>
          </div>
        </section>

        {/* RIGHT: attendance + recent activity */}
        <section className="flex flex-col gap-4 h-full">
          <AdminAttendanceChart />
          <AdminRecentActivity />
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
