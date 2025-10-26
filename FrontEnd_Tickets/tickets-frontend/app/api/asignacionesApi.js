import api from "../config/axios";
import { isAxiosError } from "axios";

function normalizeObjectResponse(data) {
  if (!data) return null;
  if (data.result) return data.result;
  if (data.data && !Array.isArray(data.data)) return data.data;
  if (!Array.isArray(data)) return data;
  return data[0] ?? null;
}

export async function asignarCliente(payload) {
  try {
    const { data } = await api.post("/asignaciones/directa", payload);
    return normalizeObjectResponse(data);
  } catch (e) {
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al asignar cliente");
    throw e;
  }
}

export async function listarCoberturas() {
  try {
    const { data } = await api.get("/asignaciones/coberturas");
    return data;
  } catch (e) {
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al obtener coberturas");
    throw e;
  }
}
