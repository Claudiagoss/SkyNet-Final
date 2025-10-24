// app/api/asignacionesApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

/** Normaliza objeto respuesta (por si viene envuelto) */
function normalizeObjectResponse(respData) {
  if (!respData) return null;
  if (respData.result) return respData.result;
  if (respData.data && !Array.isArray(respData.data)) return respData.data;
  if (!Array.isArray(respData)) return respData;
  return respData[0] ?? null;
}

/** Asignación directa Cliente → Usuario */
export async function asignarCliente(payload /* { clienteId, usuarioId } */) {
  try {
    const { data } = await api.post("/asignaciones/directa", payload);
    return normalizeObjectResponse(data) ?? data;
  } catch (e) {
    console.error("asignarCliente error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al asignar cliente");
    }
    throw e;
  }
}

/** Crear regla por Departamento → Usuario (cartera) */
export async function asignarPorDepartamento(payload /* { departamento, usuarioId, prioridad } */) {
  try {
    const { data } = await api.post("/asignaciones/departamento", payload);
    return normalizeObjectResponse(data) ?? data;
  } catch (e) {
    console.error("asignarPorDepartamento error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al crear regla por departamento");
    }
    throw e;
  }
}

/** Obtener dueño actual de un cliente */
export async function obtenerDuenioCliente(clienteId) {
  try {
    const { data } = await api.get(`/asignaciones/duenio/${clienteId}`);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("obtenerDuenioCliente error:", e);
    if (isAxiosError(e) && e.response) {
      if (e.response.status === 404) return null;
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al consultar dueño del cliente");
    }
    throw e;
  }
}

/** Recalcular dueño de un cliente */
export async function recalcularCliente(clienteId) {
  try {
    const { data } = await api.post(`/asignaciones/recalcular/${clienteId}`);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("recalcularCliente error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al recalcular dueño del cliente");
    }
    throw e;
  }
}
