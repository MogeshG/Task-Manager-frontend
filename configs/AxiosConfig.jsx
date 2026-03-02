import axios from "axios";
import { isTokenValid } from "../utils/auth";

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token && isTokenValid(token)) {
      config.headers.Authorization = token;
    } else {
      localStorage.removeItem("access_token");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRedirecting = false;

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem("access_token");

      const isAuthPage = currentPath.includes("/login") || currentPath.includes("/register");

      if (!isAuthPage && !isRedirecting) {
        isRedirecting = true;

        window.history.pushState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }

    return Promise.reject({
      ...error,
      message: error?.response?.data?.message || error.message || "Something went wrong",
      status,
    });
  },
);

export default axiosConfig;
