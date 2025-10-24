// ✅ app/utils/auth.js
const AUTH_KEY = "auth";

// =============================================================
// 🔐 Guardar token, usuario y rol en localStorage
// =============================================================
export const saveAuth = ({ token, usuario, rol }) => {
  // 🔹 Map de roles conocidos
  const roleMap = {
    admin: 1,
    administrador: 1,
    supervisor: 4,
    tecnico: 5,
    cliente: 3,
  };

  // 🔹 Si el rol viene como objeto { rolId, nombre }
  let rolId = null;
  let rolNombre = "";

  if (typeof rol === "object" && rol !== null) {
    rolId = rol.rolId || null;
    rolNombre = rol.nombre?.toLowerCase() || "";
  } else if (typeof rol === "string") {
    rolNombre = rol.toLowerCase();
    rolId = roleMap[rolNombre] || null;
  }

  // Guardar todo en localStorage
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ token, usuario, rol: rolNombre, rolId })
  );

  console.log("✅ AUTH GUARDADO:", { token, usuario, rol: rolNombre, rolId });
};

// =============================================================
// 🔍 Obtener objeto auth completo
// =============================================================
export const getAuth = () => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// 🎯 Obtener solo el token
export const getToken = () => getAuth()?.token || null;

// 🎯 Obtener nombre del usuario
export const getUser = () => {
  const auth = getAuth();
  if (!auth?.usuario) return "Usuario";

  const u = auth.usuario;

  // ✅ Si viene como objeto
  if (typeof u === "object") {
    // Prioriza nombre y apellido
    if (u.nombre && u.apellido) return `${u.nombre} ${u.apellido}`;
    // Si no hay apellido, usa nombre o username
    return u.nombre || u.username || "Usuario";
  }

  // ✅ Si viene como string (versión vieja)
  return u;
};

// =============================================================
// 🎯 Obtener el rol ID (NUMÉRICO)
// =============================================================
export const getRoleId = () => {
  const authData = getAuth();
  console.log("DEBUG AUTH OBJECT:", authData);

  if (!authData) return null;

  // ✅ Si ya viene con rolId (desde backend)
  if (authData.rolId) return Number(authData.rolId);

  // ✅ Si viene con rol string (“admin”, “supervisor”, etc.)
  const map = { admin: 1, administrador: 1, supervisor: 4, tecnico: 5, cliente: 3 };
  return map[authData.rol?.toLowerCase()] || null;
};

// =============================================================
// ❌ Cerrar sesión
// =============================================================
export const clearAuth = () => localStorage.removeItem(AUTH_KEY);

// =============================================================
// ✅ Saber si está logueado
// =============================================================
export const isLoggedIn = () => {
  const token = getToken();
  console.log("DEBUG TOKEN:", token);
  return !!token;
};

// =============================================================
// ✅ Helpers por rol
// =============================================================
export const isAdmin = () => getRoleId() === 1;
export const isSupervisor = () => getRoleId() === 4;
export const isTecnico = () => getRoleId() === 5;
export const isCliente = () => getRoleId() === 3;

// =============================================================
// ✅ Helper universal (roles múltiples)
// =============================================================
export const hasRole = (roles = []) => roles.includes(getRoleId());

// =============================================================
// ✅ Compatibilidad con versiones anteriores
// =============================================================
export const canCreateVisita = () => hasRole([1, 4]); // Admin o Supervisor
