import axios from "axios";
import { getToken } from "../utils/auth.js"; // 👈 asegúrate que existe este helper

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5058/api", // fallback local
  timeout: 10000,
});

// ======================================================
// 🔹 Interceptor: agrega automáticamente el token JWT
// ======================================================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 👈 se adjunta el JWT
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
