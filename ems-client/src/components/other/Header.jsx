// ems-client/src/components/other/Header.jsx
import { useAuth } from "../../context/AuthContext";
// import { Link, useNavigate, useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import {
  BellIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  // const location = useLocation();

  const role = user?.role || "admin";
  const displayName =
    user?.name || (role === "admin" ? "Admin User" : "Employee");
  const displayRole = role === "admin" ? "Admin" : "Employee";
  const initial = displayName?.charAt(0)?.toUpperCase() || "A";
  const profilePath = role === "admin" ? "/admin/profile" : "/employee/profile";
  const notificationsPath =
    role === "admin" ? "/admin/notifications" : "/employee/notifications";

  // const params = new URLSearchParams(location.search);
  // const initialQuery = params.get("q") || "";
  // const [searchValue, setSearchValue] = useState(initialQuery);


  useEffect(() => {
    function handleClickOutside(e) {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleNotificationsClick = () => {
    if (unreadCount > 0) {
      markAllRead();
    }
    navigate(notificationsPath);
  };

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   const currentPath = location.pathname;
  //   const qs = new URLSearchParams(location.search);
  //   if (searchValue) {
  //     qs.set("q", searchValue);
  //   } else {
  //     qs.delete("q");
  //   }
  //   navigate(`${currentPath}?${qs.toString()}`);
  // };

  return (
    <header className="mb-3">
      <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        {/* Left: mobile toggle + welcome */}
        <div className="flex items-center gap-3">
          {/* Mobile-only sidebar button */}
          <button
            className="flex md:hidden items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-sm transition-colors"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-medium text-slate-400">
              Welcome back
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {displayName}
            </span>
          </div>
        </div>

        {/* Center: search (only on sm+) */}
        {/* <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 max-w-xl mx-4 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm"
        >
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={
              role === "admin"
                ? "Search employees, tasks..."
                : "Search your tasks..."
            }
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </form> */}

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={handleNotificationsClick}
              className="relative h-9 w-9 flex items-center justify-center 
              rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-sm transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </button>
          </div>

          {/* Profile */}
          <Link
            to={profilePath}
            className="flex items-center gap-2.5 cursor-pointer px-2.5 sm:px-3 py-1.5 rounded-full transition-colors hover:bg-slate-100"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white shadow-sm shadow-sky-500/40">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs sm:text-sm font-medium text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-sky-500 leading-tight">
                {displayRole}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
