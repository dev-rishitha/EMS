// ems-client/src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import SideBar from "../components/other/SideBar";
import Header from "../components/other/Header";
import { useState } from "react";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);      // mobile drawer
  const [sidebarVisible, setSidebarVisible] = useState(true); // desktop show/hide

  // Called from Header burger and from desktop toggle if you keep it later
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    } else {
      setSidebarVisible((v) => !v);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sliding drawer */}
          <div className="fixed left-0 top-0 h-full w-64 z-50 shadow-xl bg-white">
            <SideBar
              role="admin"
              mobile
              collapsed={false}
              onToggleCollapsed={() => setSidebarOpen(false)} // X closes drawer
            />
          </div>
        </div>
      )}

      <div className="h-dvh md:h-screen bg-gray-50 flex">
        {/* Desktop Sidebar (can be hidden) */}
        {sidebarVisible && (
          <div className="hidden md:block w-56">
            {/* No toggle on desktop, just a static sidebar */}
            <SideBar role="admin" mobile={false} collapsed={false} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 py-2 sm:py-5 overflow-x-hidden overflow-y-auto">
          {/* Header: burger icon only on mobile */}
          <Header onMenuClick={handleToggleSidebar} />

          {/* App surface */}
          <div className="mt-3 min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-104px)] px-3 sm:px-6 py-3 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminLayout;
