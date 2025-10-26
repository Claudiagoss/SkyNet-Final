// =============================================================
// 🌐 API SKYNET MÓVIL — React Native + .NET 8 (Azure Ready)
// =============================================================

console.log("✅ api.js cargado correctamente (React Native)");

import axios from "axios";

// 🧩 URLs de microservicios en Azure
const AUTH_API = "https://skynet-authservice-debtbpcjcxd7c5cw.canadacentral-01.azurewebsites.net/api";
const TICKETS_API = "https://ticket-api-nueva-gcambrbedhawcaht.canadacentral-01.azurewebsites.net/api";

// 🔗 Endpoints base
export const apiAuth = axios.create({ baseURL: AUTH_API, timeout: 10000 });
export const apiTickets = axios.create({ baseURL: TICKETS_API, timeout: 10000 });

// =============================================================
// 🔐 LOGIN
// =============================================================
export const loginUser = async (credenciales) => {
  try {
    console.log("📤 Enviando login a:", `${AUTH_API}/auth/login`);
    const res = await apiAuth.post("/auth/login", credenciales);
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
    console.log("📡 URL completa:", `${TICKETS_API}/tickets/visitas/tecnico/${usuarioId}`);
    console.log("🪪 Token enviado:", token?.substring(0, 30) + "...");
    const res = await apiTickets.get(`/tickets/visitas/tecnico/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error cargando visitas por técnico:", error.response?.status, error.message);
    throw error;
  }
};
// =============================================================
// 🕒 HISTORIAL DE VISITAS COMPLETADAS
// =============================================================
export const getHistorialPorTecnico = async (usuarioId, token) => {
  try {
    const res = await apiTickets.get(`/tickets/visitas/completadas`, {
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
    const res = await apiTickets.post(`/tickets/${ticketId}/checkin`, datos, {
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
    const res = await apiTickets.post(`/tickets/${ticketId}/checkout`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error en Check-Out:", error.message);
    throw error;
  }
};
