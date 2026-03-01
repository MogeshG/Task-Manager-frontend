import axios from "axios";
import { isTokenValid } from "./auth";

const axiosConfig = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");

      if (isTokenValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem("access_token");
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export default axiosConfig;
