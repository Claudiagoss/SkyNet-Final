// =============================================================
// 🌐 Configuración global de Axios — SkyNet Frontend
// =============================================================
import axios from "axios";
import { getToken } from "../utils/auth.js"; // helper que gestiona el JWT

// =============================================================
// 🔧 URLs dinámicas (local o Azure)
// =============================================================
// En .env (modo dev) o .env.production (modo build)
// 🚀 Usar siempre variables de entorno (sin fallback a localhost)
const AUTH_API = import.meta.env.VITE_AUTH_BASE_URL;
const TICKETS_API = import.meta.env.VITE_TICKETS_BASE_URL;

// 🧠 En modo desarrollo, podés usar .env.local si querés localhost manualmente
if (!AUTH_API || !TICKETS_API) {
  console.warn("⚠️ Variables de entorno VITE_* no definidas, revisa tu archivo .env o .env.production");
}
// =============================================================
// 🧱 Instancias base por microservicio
// =============================================================
export const authApi = axios.create({
  baseURL: AUTH_API,
  timeout: 15000,
});

export const ticketsApi = axios.create({
  baseURL: TICKETS_API,
  timeout: 15000,
});

// =============================================================
// 🔐 Interceptor global: agrega token JWT automáticamente
// =============================================================
const attachToken = (config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
ticketsApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// =============================================================
// 📤 Exportación por defecto (compatibilidad con imports antiguos)
// =============================================================
export default ticketsApi;
export { AUTH_API, TICKETS_API };
