import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import BreadCrumbs from "../components/BreadCrumbs";

const PrivateRoute = () => {
  const token = localStorage.getItem("access_token");

  return isTokenValid(token) ? (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="w-full h-full flex">
        <Sidebar />
        <div className="w-full flex-1 overflow-hidden p-4 bg-gray-100 flex flex-col gap-4">
          <BreadCrumbs />
          <div className="flex-1 min-h-0 overflow-hidden">
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
