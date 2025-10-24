// app/api/usuariosApi.js
import api from "../config/axios";
import { isAxiosError } from "axios";

/** Normaliza respuestas tipo lista */
function normalizeArrayResponse(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.usuarios)) return respData.usuarios;
  if (Array.isArray(respData.data)) return respData.data;
  if (Array.isArray(respData.items)) return respData.items;
  return [];
}

/** Normaliza respuestas tipo objeto (detalle) */
function normalizeObjectResponse(respData) {
  if (!respData) return null;
  if (respData.usuario) return respData.usuario;
  if (respData.data && !Array.isArray(respData.data)) return respData.data;
  if (!Array.isArray(respData)) return respData;
  return respData[0] ?? null;
}

/** Listar (GET /api/usuarios) */
export async function obtenerUsuarios() {
  try {
    const { data } = await api.get("/usuarios");
    return normalizeArrayResponse(data);
  } catch (e) {
    console.error("obtenerUsuarios error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al obtener usuarios");
    }
    throw e;
  }
}

/** Crear (POST /api/usuarios) */
export async function crearUsuario(payload) {
  try {
    const { data } = await api.post("/usuarios", payload);
    return normalizeObjectResponse(data) ?? data;
  } catch (e) {
    console.error("crearUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al crear usuario");
    }
    throw e;
  }
}

/** Actualizar (PUT /api/usuarios/{id}) */
export async function actualizarUsuario(id, payload) {
  try {
    await api.put(`/usuarios/${id}`, payload);
    return true;
  } catch (e) {
    console.error("actualizarUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al actualizar usuario");
    }
    throw e;
  }
}

/** Borrar (DELETE /api/usuarios/{id}) */
export async function borrarUsuario(id) {
  try {
    await api.delete(`/usuarios/${id}`);
    return true;
  } catch (e) {
    console.error("borrarUsuario error:", e);
    if (isAxiosError(e) && e.response) {
      throw new Error(e.response.data?.error || e.response.data?.message || "Error al borrar usuario");
    }
    throw e;
  }
}

/** (opcional) Detalle */
export async function obtenerUsuarioPorId(id) {
  try {
    const { data } = await api.get(`/usuarios/${id}`);
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
