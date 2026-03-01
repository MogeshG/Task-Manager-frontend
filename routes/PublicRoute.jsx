import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

const PublicRoute = () => {
  const token = localStorage.getItem("access_token");

  return isTokenValid(token) ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
