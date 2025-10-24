// =============================================================
// 🌐 API SKYNET MÓVIL — React Native + .NET 8
// =============================================================

console.log("✅ api.js cargado correctamente (React Native)");

import axios from "axios";

// 🧩 IP del backend (.NET 8)
const API_URL = "http://192.168.1.36:5058/api";

// Configuración base de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 s de espera
});

// =============================================================
// 🔐 LOGIN
// =============================================================
export const loginUser = async (credenciales) => {
  try {
    console.log("📤 Enviando login a:", `${API_URL}/auth/login`);
    const res = await api.post("/auth/login", credenciales);
    console.log("📥 Respuesta login:", res.status);
    return res.data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw error;
  }
};

// =============================================================
// 🧾 VISITAS ACTIVAS POR TÉCNICO
// =============================================================
export const getVisitasPorTecnico = async (usuarioId, token) => {
  try {
    const res = await api.get(`/tickets/visitas/tecnico/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error cargando visitas por técnico:", error.message);
    throw error;
  }
};

// =============================================================
// 🕒 HISTORIAL DE VISITAS COMPLETADAS
// =============================================================
export const getHistorialPorTecnico = async (usuarioId, token) => {
  try {
    const res = await api.get(`/tickets/visitas/completadas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error cargando historial:", error.message);
    throw error;
  }
};

// =============================================================
// 📍 CHECK-IN DE VISITA
// =============================================================
export const checkInVisita = async (ticketId, datos, token) => {
  try {
    const res = await api.post(`/tickets/${ticketId}/checkin`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error en Check-In:", error.message);
    throw error;
  }
};

// =============================================================
// ✅ CHECK-OUT / CIERRE DE VISITA
// =============================================================
export const checkOutVisita = async (ticketId, datos, token) => {
  try {
    const res = await api.post(`/tickets/${ticketId}/checkout`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error en Check-Out:", error.message);
    throw error;
  }
};

// =============================================================
// Export global de la URL base
// =============================================================
export { API_URL };
