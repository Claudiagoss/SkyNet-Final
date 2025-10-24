// app/api/clientesApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

/**
 * Normaliza respuestas que pueden venir en varias formas:
 * - Array directo: [...]
 * - Objeto con { clientes: [...] }
 * - Objeto con { data: [...] } (otro patrón común)
 * - Objeto con { items: [...] }
 * Devuelve siempre un array (posiblemente vacío).
 */
function normalizeArrayResponse(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.clientes)) return respData.clientes;
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  // Si la respuesta es un objeto único (no lista), devolverlo como array de 1 elemento
  return [];
}

/**
 * Crear un cliente
 * @param {Object} payload - { nombre, contacto, email, telefono, direccion, ... }
 * @returns {Object} cliente creado (según lo que envíe tu backend)
 */
export async function crearCliente(payload) {
  try {
    const { data } = await api.post("/clientes", payload);
    return data;
  } catch (e) {
    console.error("crearCliente error:", e);
    if (isAxiosError(e) && e.response) {
      // Intenta devolver un mensaje de error útil desde la respuesta del backend
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al crear cliente");
    }
    throw e;
  }
}

/**
 * Obtener todos los clientes (normalizado a array)
 * @returns {Array} lista de clientes
 */
export async function obtenerClientes() {
  try {
    const resp = await api.get("/clientes");
    return normalizeArrayResponse(resp.data);
  } catch (e) {
    console.error("obtenerClientes error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener clientes");
    }
    throw e;
  }
}

/**
 * Obtener cliente por Id
 * @param {number|string} id
 * @returns {Object|null} cliente o null si no existe
 */
export async function obtenerClientePorId(id) {
  try {
    const { data } = await api.get(`/clientes/${id}`);
    // Si el backend devuelve { cliente: {...} } o { data: {...} }, normalizamos
    if (!data) return null;
    if (data.cliente) return data.cliente;
    if (data.data && !Array.isArray(data.data)) return data.data;
    // Si viene un objeto cliente directo:
    if (!Array.isArray(data)) return data;
    // Si por alguna razón es un array, devolvemos el primer elemento
    return data[0] ?? null;
  } catch (e) {
    console.error("obtenerClientePorId error:", e);
    if (isAxiosError(e) && e.response) {
      // Si el servidor devuelve 404 quizá venga en response.status
      if (e.response.status === 404) return null;
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener cliente");
    }
    throw e;
  }
}

/**
 * Actualizar cliente
 * @param {number|string} id
 * @param {Object} payload
 */
export async function actualizarCliente(id, payload) {
  try {
    await api.put(`/clientes/${id}`, payload);
  } catch (e) {
    console.error("actualizarCliente error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al actualizar cliente");
    }
    throw e;
  }
}

/**
 * Borrar cliente
 * @param {number|string} id
 */
export async function borrarCliente(id) {
  try {
    await api.delete(`/clientes/${id}`);
  } catch (e) {
    console.error("borrarCliente error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al eliminar cliente");
    }
    throw e;
  }
}
