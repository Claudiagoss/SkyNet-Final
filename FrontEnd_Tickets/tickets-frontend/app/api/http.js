// ============================================================
// 🌐 HTTP Axios Config — SkyNet Frontend (sin localhost fijo)
// ============================================================
import axios from "axios";
import { getToken } from "../utils/auth";

// ✅ Base URL dinámica: toma de .env o usa fallback de Azure
const BASE_URL = import.meta.env.VITE_TICKETS_BASE_URL || "https://skynet-ticketapi-eyd8aaa8hzb0crdh.canadacentral-01.azurewebsites.net/api";

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ============================================================
// 🔐 Interceptor para agregar JWT automáticamente
// ============================================================
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
