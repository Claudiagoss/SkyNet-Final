// ================================================================
// 🎫 TICKETS API — SkyNet (Frontend → TicketsService .NET 8)
// ================================================================
import axios from "axios";
import { getToken } from "../utils/auth.js";
import { ticketsApi } from "../config/axios";

// ================================================================
// 🔹 Helper para encabezados de autorización
// ================================================================
function getHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================================================================
// 🔹 Helper genérico para manejo de errores
// ================================================================
function handleError(error, action = "operación") {
  console.error(`❌ Error en ${action}:`, error);
  const message =
    error?.response?.data?.message ||
    error?.response?.data ||
    error?.message ||
    `Error al realizar ${action}`;
  return { ok: false, message };
}

// ================================================================
// === CRUD PRINCIPAL DE TICKETS ===
// ================================================================
export const obtenerTickets = async () => {
  try {
    const res = await ticketsApi.get("/tickets", { headers: getHeaders() });
    return res.data;
  } catch (err) {
    return handleError(err, "obtener tickets");
  }
};

export const obtenerTicketPorId = async (id) => {
  try {
    const res = await ticketsApi.get(`/tickets/${id}`, { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, `obtener ticket #${id}`);
  }
};

export const crearTicket = async (nuevoTicket) => {
  try {
    const res = await ticketsApi.post("/tickets", nuevoTicket, { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, "crear ticket");
  }
};

export const actualizarTicket = async (id, datos) => {
  try {
    const res = await ticketsApi.put(`/tickets/${id}`, datos, { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, `actualizar ticket #${id}`);
  }
};

export const eliminarTicket = async (id) => {
  try {
    const res = await ticketsApi.delete(`/tickets/${id}`, { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, `eliminar ticket #${id}`);
  }
};

// ================================================================
// === CERRAR TICKET (envía correo automáticamente desde backend) ===
// ================================================================
export const cerrarTicket = async (ticketId) => {
  try {
    const res = await ticketsApi.put(`/tickets/${ticketId}/cerrar`, {}, { headers: getHeaders() });
    const data = res.data;
    return {
      ok: true,
      message: data?.mensaje || "✅ Ticket cerrado correctamente.",
      cliente: data?.cliente || "Sin cliente",
      correo: data?.correo || "Sin correo registrado",
    };
  } catch (err) {
    return handleError(err, `cerrar ticket #${ticketId}`);
  }
};

// ================================================================
// === VISITAS ===
// ================================================================
export const obtenerVisitasActivas = async () => {
  try {
    const res = await ticketsApi.get("/tickets/visitas/activas", { headers: getHeaders() });
    return res.data;
  } catch (err) {
    return handleError(err, "obtener visitas activas");
  }
};

export const obtenerVisitasCompletadas = async () => {
  try {
    const res = await ticketsApi.get("/tickets/visitas/completadas", { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, "obtener visitas completadas");
  }
};

// ================================================================
// === CHECK-IN y CHECK-OUT GPS ===
// ================================================================
export const checkInVisita = async (ticketId, lat, lng) => {
  try {
    const payload = {
      ticketId: Number(ticketId),
      latitudIngreso: lat,
      longitudIngreso: lng,
    };
    const res = await ticketsApi.post(`/tickets/${ticketId}/checkin`, payload, {
      headers: getHeaders(),
    });
    return { ok: true, message: res.data };
  } catch (err) {
    return handleError(err, `check-in del ticket #${ticketId}`);
  }
};

export const checkOutVisita = async (ticketId, lat, lng, reporteFinal = "") => {
  try {
    const payload = {
      latitudSalida: lat,
      longitudSalida: lng,
      reporteFinal,
    };
    const res = await ticketsApi.post(`/tickets/${ticketId}/checkout`, payload, {
      headers: getHeaders(),
    });
    return { ok: true, message: res.data };
  } catch (err) {
    return handleError(err, `check-out del ticket #${ticketId}`);
  }
};

// ================================================================
// === CAMBIAR ESTADO MANUAL (sin cerrar ticket) ===
// ================================================================
export const cambiarEstadoTicket = async (id, estadoId) => {
  try {
    const res = await ticketsApi.put(`/tickets/${id}`, { estadoId }, { headers: getHeaders() });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, `cambiar estado del ticket #${id}`);
  }
};

// ================================================================
// === CREAR VISITA CON CHECK-IN AUTOMÁTICO ===
// ================================================================
export const crearVisitaConCheckIn = async (ticketPayload, lat, lng) => {
  try {
    // 1️⃣ Crear el ticket
    const ticket = await crearTicket(ticketPayload);
    if (!ticket.ok) throw new Error(ticket.message);
    const ticketId = ticket.data?.ticketId || ticket.data?.id || ticket.data?.TicketId;

    if (!ticketId) throw new Error("No se recibió TicketId del backend");

    // 2️⃣ Registrar el check-in si hay coordenadas
    if (lat != null && lng != null) {
      await checkInVisita(ticketId, lat, lng);
    }

    return { ok: true, ticketId };
  } catch (err) {
    return handleError(err, "crear visita con check-in");
  }
};


// ================================================================
// === OBTENER TICKETS POR TÉCNICO (para Admin / Supervisor) ===
// ================================================================
export const obtenerTicketsPorTecnico = async (usuarioId) => {
  try {
    const res = await ticketsApi.get(`/tickets/por-tecnico/${usuarioId}`, {
      headers: getHeaders(),
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return handleError(err, `obtener tickets del técnico #${usuarioId}`);
  }
};