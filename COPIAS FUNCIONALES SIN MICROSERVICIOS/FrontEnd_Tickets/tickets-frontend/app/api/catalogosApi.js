// app/api/catalogosApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

// Normalizador genérico para listas
function normalizeArrayResponse(respData, keyCandidates = []) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  for (const key of keyCandidates) {
    if (Array.isArray(respData[key])) return respData[key];
  }
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  return [];
}

// ESTADOS
export async function obtenerEstados() {
  try {
    const resp = await api.get("/catalogos/estados");
    // Intenta: estados, data, items, array directo
    return normalizeArrayResponse(resp.data, ["estados"]);
  } catch (e) {
    console.error("obtenerEstados error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener estados");
    }
    throw e;
  }
}

// PRIORIDADES
export async function obtenerPrioridades() {
  try {
    const resp = await api.get("/catalogos/prioridades");
    // Intenta: prioridades, data, items, array directo
    return normalizeArrayResponse(resp.data, ["prioridades"]);
  } catch (e) {
    console.error("obtenerPrioridades error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener prioridades");
    }
    throw e;
  }
}
