import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { isTokenValid } from "../utils/auth";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import BreadCrumbs from "../components/BreadCrumbs";

const PrivateRoute = () => {
  const token = localStorage.getItem("access_token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return isTokenValid(token) ? (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex flex-1 min-h-0 relative">
        {isSidebarOpen && (
          <div
            className="md:hidden absolute inset-0 bg-black/50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`absolute md:static inset-y-0 left-0 z-20 transform transition-transform duration-300 md:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col p-3 md:p-4 bg-gray-100 gap-4 min-h-0 w-full overflow-hidden">
          <div className="hidden md:block">
            <BreadCrumbs />
          </div>

          <div className="flex-1 overflow-hidden min-h-0 h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
