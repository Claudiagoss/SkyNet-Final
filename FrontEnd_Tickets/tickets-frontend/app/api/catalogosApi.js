import api from "../config/axios";
import { isAxiosError } from "axios";

function normalizeArrayResponse(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data[key])) return data[key];
  return data?.data || [];
}

export async function obtenerEstados() {
  try {
    const { data } = await api.get("/catalogos/estados");
    return normalizeArrayResponse(data, ["estados"]);
  } catch (e) {
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al obtener estados");
    throw e;
  }
}

export async function obtenerPrioridades() {
  try {
    const { data } = await api.get("/catalogos/prioridades");
    return normalizeArrayResponse(data, ["prioridades"]);
  } catch (e) {
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al obtener prioridades");
    throw e;
  }
}
