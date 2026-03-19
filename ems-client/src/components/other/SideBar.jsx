// ems-client/src/components/other/SideBar.jsx
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOffice2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTasks } from "../../context/TaskContext";
import { useLeave } from "../../context/LeaveContext";
import { useAuth } from "../../context/AuthContext";
// import { useNotifications } from "../../context/NotificationContext";

function SideBar({
  role = "admin",
  mobile = false,
  collapsed = false,
  onToggleCollapsed,
}) {
  const { employeeNewTaskCount } = useTasks();
  const { leaveRequests } = useLeave();
  const { logout, user } = useAuth();
  // const { unreadCount } = useNotifications();

  const adminPendingLeaveCount =
    role === "admin"
      ? leaveRequests.filter(
          (r) => r.status === "Pending" || r.status === "pending"
        ).length
      : 0;

  const appTitle = role === "admin" ? "EMS Admin" : "EMS Employee";
  const companyName = user?.org?.orgName || "Your Company";

  const showLabels = !collapsed || mobile;

  return (
    <aside
      className={`
        h-full flex flex-col
        bg-gradient-to-b from-white via-sky-50 to-slate-50
        border-r border-slate-200/70
        ${mobile ? "p-3 sm:p-4" : "p-2 sm:p-3"}
      `}
    >
      {/* Top: brand + (mobile close) */}
      <div className="mt-4 mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-sky-600 flex items-center justify-center text-[11px] font-semibold text-white">
            EM
          </div>
          {showLabels && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 leading-tight truncate">
                {appTitle}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {companyName}
              </span>
            </div>
          )}
        </div>

        {/* Toggle button: only visible in mobile sidebar (close icon) */}
        {mobile && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Company card (hidden when collapsed on desktop) */}
      {!collapsed && (
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Company
          </p>
          <div className="mt-2 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] px-2.5 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10">
              <BuildingOffice2Icon className="h-4 w-4 text-sky-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate">
                {companyName}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">
                Smart workspace
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main menu */}
      <div className="flex-1 flex flex-col min-h-0">
        {!collapsed && (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Main menu
          </p>
        )}

        <nav className="mt-2 space-y-1.5 text-sm overflow-y-auto pr-1">
          {role === "admin" && (
            <>
              <MenuItem
                to="/admin/dashboard"
                text="Dashboard"
                icon={HomeIcon}
                end
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/admin/employees"
                text="Employees"
                icon={UsersIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/admin/tasks"
                text="All Tasks"
                icon={ClipboardDocumentListIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/admin/attendance"
                text="Attendance"
                icon={CalendarDaysIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/admin/leave"
                text="Leave Requests"
                icon={CalendarDaysIcon}
                badge={adminPendingLeaveCount}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/admin/activities"
                text="Activity"
                icon={BellAlertIcon}
                collapsed={collapsed && !mobile}
              />
            </>
          )}

          {role === "employee" && (
            <>
              <MenuItem
                to="/employee"
                text="Dashboard"
                icon={HomeIcon}
                end
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/employee/tasks"
                text="Work Assignments"
                icon={ClipboardDocumentListIcon}
                badge={employeeNewTaskCount}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/employee/attendance"
                text="Time & Absences"
                icon={CalendarDaysIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/employee/calendar"
                text="Calendar"
                icon={CalendarIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/employee/reports"
                text="Analytics"
                icon={ChartBarIcon}
                collapsed={collapsed && !mobile}
              />
              <MenuItem
                to="/employee/activity"
                text="Timeline"
                icon={ClockIcon}
                collapsed={collapsed && !mobile}
              />
            </>
          )}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-sm mt-3">
        <MenuItem
          to={role === "admin" ? "/admin/settings" : "/employee/settings"}
          text="Settings"
          icon={Cog6ToothIcon}
          collapsed={collapsed && !mobile}
        />
        <MenuItem
          to={role === "admin" ? "/admin/help" : "/employee/help"}
          text="Help"
          icon={QuestionMarkCircleIcon}
          collapsed={collapsed && !mobile}
        />

        <button
          type="button"
          onClick={logout}
          className="
            w-full flex items-center
            px-2.5 py-2 rounded-lg cursor-pointer transition-colors
            text-sm text-rose-600 hover:bg-rose-50
          "
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
          {showLabels && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function MenuItem({ to, text, end = false, icon: Icon, badge = 0, collapsed }) {
  const showLabel = !collapsed;

  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div
          className={`
            group flex items-center justify-between
            px-2.5 py-2 rounded-xl cursor-pointer transition-all
            ${isActive
              ? "bg-gradient-to-r from-sky-500/10 to-emerald-500/10 text-sky-800 border border-sky-200 shadow-sm"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}
          `}
          title={collapsed ? text : undefined}
        >
          <span className="flex items-center gap-2.5">
            {Icon && (
              <Icon
                className={`
                  h-4 w-4
                  ${isActive
                    ? "text-sky-600"
                    : "text-slate-400 group-hover:text-sky-500"}
                `}
              />
            )}
            {showLabel && <span>{text}</span>}
          </span>

          {badge > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-rose-500 text-[11px] font-semibold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

export default SideBar;
