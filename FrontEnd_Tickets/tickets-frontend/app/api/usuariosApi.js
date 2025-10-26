// ================================================================
// 👤 USUARIOS API — Integrado con AuthService (Azure)
// ================================================================
import { authApi } from "../config/axios";
import { isAxiosError } from "axios";
import { getToken } from "../utils/auth.js"; // ✅ importante

// ================================================================
// 🔹 Normalizadores
// ================================================================
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

function handleError(e, ctx = "operación") {
  console.error(`❌ usuariosApi > ${ctx}:`, e);
  if (isAxiosError(e) && e.response) {
    throw new Error(
      e.response.data?.message ||
        e.response.data?.error ||
        `Error en ${ctx}`
    );
  }
  throw e;
}

// ================================================================
// 🔹 LECTURA
// ================================================================
export async function obtenerUsuarios(rolId = null) {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await authApi.get("/usuarios", { headers });
    const usuarios = normalizeArrayResponse(data);

    if (rolId) {
      return usuarios.filter(
        (u) =>
          u.rolId == rolId ||
          u.rol == rolId ||
          u.rolNombre?.toLowerCase()?.includes("técnico")
      );
    }

    return usuarios;
  } catch (e) {
    handleError(e, "obtener usuarios");
  }
}

export async function obtenerUsuarioPorId(id) {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await authApi.get(`/usuarios/${id}`, { headers });
    return normalizeObjectResponse(data);
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    handleError(e, `obtener usuario #${id}`);
  }
}

// ================================================================
// 🔹 ESCRITURA
// ================================================================
export async function crearUsuario(payload) {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await authApi.post("/usuarios", payload, { headers });
    return normalizeObjectResponse(data);
  } catch (e) {
    handleError(e, "crear usuario");
  }
}

export const actualizarUsuario = async (id, datos) => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 🧼 1. Limpieza + mapeo para backend .NET
    const payload = {
      ...datos,
      rolId: Number(datos.rolId),
      Rol: datos.rolNombre || datos.rol || String(datos.rolId), // 👈 agregado para backend
    };

    // 🧹 2. Eliminar campos vacíos
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] == null) delete payload[k];
    });

    // 🧠 3. Log de depuración
    console.log(`📤 Enviando PUT /usuarios/${id}:`, payload);

    // 🚀 4. Llamada
    const { data } = await authApi.put(`/usuarios/${id}`, payload, { headers });

    console.log(`✅ Usuario #${id} actualizado correctamente`);
    return data;
  } catch (err) {
    console.error(`❌ usuariosApi > actualizar usuario #${id}:`, err);
    if (err.response?.data)
      console.log("🩻 Detalle backend:", err.response.data);
    throw err;
  }
};


export async function borrarUsuario(id) {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await authApi.delete(`/usuarios/${id}`, { headers });
    return true;
  } catch (e) {
    handleError(e, `borrar usuario #${id}`);
  }
}
