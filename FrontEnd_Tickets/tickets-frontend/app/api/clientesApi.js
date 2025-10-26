// ================================================================
// 👥 CLIENTES API — TicketsService (.NET 8 / Azure)
// ================================================================
import api from "../config/axios";
import { isAxiosError } from "axios";

/**
 * 🔹 Normaliza la estructura de respuesta del backend
 */
function normalizeArrayResponse(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.clientes)) return respData.clientes;
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  return [];
}

function normalizeObjectResponse(respData) {
  if (!respData) return null;
  if (respData.cliente) return respData.cliente;
  if (respData.data && !Array.isArray(respData.data)) return respData.data;
  if (!Array.isArray(respData)) return respData;
  return respData[0] ?? null;
}

// ================================================================
// 🔹 OBTENER CLIENTES
// ================================================================
export async function obtenerClientes() {
  try {
    const resp = await api.get("/clientes");
    return normalizeArrayResponse(resp.data);
  } catch (e) {
    console.error("obtenerClientes error:", e);
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al obtener clientes");
    throw e;
  }
}

// ================================================================
// 🔹 CREAR CLIENTE
// ================================================================
export async function crearCliente(payload) {
  try {
    const { data } = await api.post("/clientes", payload);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("crearCliente error:", e);
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al crear cliente");
    throw e;
  }
}

// ================================================================
// 🔹 ACTUALIZAR CLIENTE
// ================================================================
export async function actualizarCliente(id, payload) {
  try {
    const { data } = await api.put(`/clientes/${id}`, payload);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("actualizarCliente error:", e);
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al actualizar cliente");
    throw e;
  }
}

// ================================================================
// 🔹 ELIMINAR CLIENTE
// ================================================================
export async function borrarCliente(id) {
  try {
    await api.delete(`/clientes/${id}`);
    return true;
  } catch (e) {
    console.error("borrarCliente error:", e);
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al eliminar cliente");
    throw e;
  }
}

// ================================================================
// 🔹 OBTENER CLIENTE POR ID
// ================================================================
export async function obtenerClientePorId(id) {
  try {
    const { data } = await api.get(`/clientes/${id}`);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("obtenerClientePorId error:", e);
    if (isAxiosError(e) && e.response) {
      if (e.response.status === 404) return null;
      throw new Error(e.response.data?.message || "Error al obtener cliente");
    }
    throw e;
  }
}
