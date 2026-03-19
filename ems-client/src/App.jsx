import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import ProtectedRoute from "./context/ProtectedRoute";
import ProfilePage from "./pages/common/ProfilePage";

import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import EmployeeMyTasks from "./pages/employee/EmployeeMyTasks";
import EmployeeAttendanceLeave from "./pages/employee/EmployeeAttendanceLeave";
import EmployeeSettings from "./pages/employee/EmployeeSettings";
import EmployeeCalendar from "./pages/employee/EmployeeCalendar";
import EmployeeActivity from "./pages/employee/EmployeeActivity";
import EmployeeReports from "./pages/employee/EmployeeReports";
import EmployeeNotification from "./pages/employee/EmployeeNotification";
import EmployeeHelp from "./pages/employee/EmployeeHelp";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminLeaveRequests from "./pages/admin/AdminLeaveRequests";
import AdminAttendancePage from "./components/Admin/AdminAttendancePage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminNotifications from "./pages/admin/AdminNotifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="employees"
            element={
              <ProtectedRoute role="admin">
                <AdminEmployees />
              </ProtectedRoute>
            }
          />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="activities" element={<AdminActivityPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route
            path="leave"
            element={
              <ProtectedRoute role="admin">
                <AdminLeaveRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute role="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="help"
            element={
              <ProtectedRoute role="admin">
                <AdminHelp />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute role="admin">
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Employee */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tasks" element={<EmployeeMyTasks />} />
          <Route path="attendance" element={<EmployeeAttendanceLeave />} />
          <Route path="settings" element={<EmployeeSettings />} />
          <Route path="calendar" element={<EmployeeCalendar />} />
          <Route path="reports" element={<EmployeeReports />} />
          <Route path="activity" element={<EmployeeActivity />} />
          <Route path="notifications" element={<EmployeeNotification />} />
          <Route path="help" element={<EmployeeHelp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
