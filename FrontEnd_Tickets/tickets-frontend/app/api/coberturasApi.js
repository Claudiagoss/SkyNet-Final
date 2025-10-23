// app/api/coberturasApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

/** Normaliza array de coberturas */
function normalizeArrayResponse(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.coberturas)) return respData.coberturas;
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  return [];
}

/** Listar coberturas (opcional filtro por departamento) */
export async function listarCoberturas(departamento) {
  try {
    const resp = await api.get("/asignaciones/coberturas", {
      params: departamento ? { departamento } : undefined,
    });
    return normalizeArrayResponse(resp.data);
  } catch (e) {
    console.error("listarCoberturas error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener coberturas");
    }
    throw e;
  }
}

/** Crear cobertura manual */
export async function crearCobertura(payload /* { departamento, usuarioId, prioridad } */) {
  try {
    const { data } = await api.post("/asignaciones/coberturas", payload);
    return data;
  } catch (e) {
    console.error("crearCobertura error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al crear cobertura");
    }
    throw e;
  }
}

/** Desactivar cobertura */
export async function desactivarCobertura(usuarioCoberturaId) {
  try {
    await api.delete(`/asignaciones/coberturas/${usuarioCoberturaId}`);
  } catch (e) {
    console.error("desactivarCobertura error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al desactivar cobertura");
    }
    throw e;
  }
}
