// ems-client/src/layouts/EmployeeLayout.jsx
import { Outlet } from "react-router-dom";
import SideBar from "../components/other/SideBar";
import Header from "../components/other/Header";
import { useState } from "react";

function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);      // mobile drawer

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 z-50 shadow-xl bg-white">
            <SideBar
              role="employee"
              mobile
              collapsed={false}
              onToggleCollapsed={() => setSidebarOpen(false)} // X closes
            />
          </div>
        </div>
      )}

      <div className="h-dvh md:h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56">
          <SideBar role="employee" mobile={false} collapsed={false} />
        </div>

        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-5 py-3 sm:py-5 overflow-x-hidden overflow-y-auto">
          <Header onMenuClick={handleToggleSidebar} />

          {/* Dashboard surface */}
          <div className="mt-3 min-h-[calc(100vh-96px)] px-3 sm:px-6 py-3 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default EmployeeLayout;