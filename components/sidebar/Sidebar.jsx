import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const currentRoute = useLocation();

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Projects",
      path: "/projects",
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
  return (
    <div className="w-60 h-full shadow-md flex flex-col p-4">
      <ul className="flex flex-col gap-2">
        {routes.map((route) => (
          <li
            onClick={() => navigate(route.path)}
            className={`w-full p-2 rounded-md cursor-pointer ${currentRoute.pathname.includes(route.path) ? "bg-green-200 border-r-6 border-r-green-500" : ""} `}
          >
            {route.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
