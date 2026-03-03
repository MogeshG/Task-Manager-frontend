import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const currentRoute = useLocation();

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Tasks",
      path: "/tasks",
    },
    {
      name: "Settings",
      path: "/settings",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose && onClose();
  };

  return (
    <div className="w-60 h-full shadow-md flex flex-col p-4 bg-white">
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="md:hidden self-end mb-4 text-2xl text-gray-600 hover:text-gray-900"
        aria-label="Close sidebar"
      >
        ✕
      </button>

      <ul className="flex flex-col gap-2">
        {routes.map((route) => (
          <li
            key={route.path}
            onClick={() => handleNavigation(route.path)}
            className={`w-full p-3 rounded-md cursor-pointer transition-colors ${
              currentRoute.pathname.includes(route.path)
                ? "bg-green-200 border-r-4 border-r-green-500 text-green-700 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            } `}
          >
            {route.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
