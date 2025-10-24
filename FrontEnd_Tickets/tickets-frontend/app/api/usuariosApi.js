// app/api/usuariosApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

/* ===============================================================
   🔹 CONFIG BASE
   =============================================================== */
// Cambia el puerto si tu AuthService usa otro (por defecto 5090)
const API_URL = "http://localhost:5090/api/usuarios";

/* ===============================================================
   🔹 Helpers de normalización
   =============================================================== */
function normalizeArrayResponse(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.usuarios)) return respData.usuarios;
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  return [];
}

function normalizeObjectResponse(respData) {
  if (!respData) return null;
  if (respData.usuario) return respData.usuario;
  if (respData.data && !Array.isArray(respData.data)) return respData.data;
  if (!Array.isArray(respData)) return respData;
  return respData[0] ?? null;
}

/* ===============================================================
   🔹 CRUD PRINCIPAL
   =============================================================== */
export async function obtenerUsuarios() {
  try {
    const { data } = await api.get(API_URL);
    return normalizeArrayResponse(data);
  } catch (e) {
    console.error("obtenerUsuarios error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener usuarios");
    }
    throw e;
  }
}

export async function crearUsuario(payload) {
  try {
    const { data } = await api.post(API_URL, payload);
    return normalizeObjectResponse(data) ?? data;
  } catch (e) {
    console.error("crearUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al crear usuario");
    }
    throw e;
  }
}

export async function actualizarUsuario(id, payload) {
  try {
    await api.put(`${API_URL}/${id}`, payload);
    return true;
  } catch (e) {
    console.error("actualizarUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al actualizar usuario");
    }
    throw e;
  }
}

export async function borrarUsuario(id) {
  try {
    await api.delete(`${API_URL}/${id}`);
    return true;
  } catch (e) {
    console.error("borrarUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al borrar usuario");
    }
    throw e;
  }
}

export async function obtenerUsuarioPorId(id) {
  try {
    const { data } = await api.get(`${API_URL}/${id}`);
    return normalizeObjectResponse(data);
  } catch (e) {
    console.error("obtenerUsuarioPorId error:", e);
    if (isAxiosError(e) && e.response) {
      if (e.response.status === 404) return null;
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener usuario");
    }
    throw e;
  }
}
