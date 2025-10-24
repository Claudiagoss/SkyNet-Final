// ✅ app/utils/auth.js
const AUTH_KEY = "auth";

// 🔐 Guardar token, usuario y rolId en localStorage
export const saveAuth = ({ token, usuario, rol }) => {
  // Mapear rol string → id numérico
  const roleMap = { admin: 1, supervisor: 4, tecnico: 5, cliente: 3 };
  const rolId = roleMap[rol?.toLowerCase()] || null;

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ token, usuario, rol, rolId }) // 👈 ahora se guardan ambos
  );
};

// 🔍 Obtener objeto auth completo
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

// 🎯 Obtener nombre usuario
export const getUser = () => getAuth()?.usuario || "Usuario";

// 🎯 Obtener el rol ID (NUMÉRICO)

export const getRoleId = () => {
  const authData = getAuth();
  console.log("DEBUG AUTH OBJECT:", authData);

  if (!authData) return null;

  // ✅ Si ya viene como número (rolId), usarlo directo
  if (authData.rolId) return Number(authData.rolId);

  // ✅ Si viene como string (`rol: "admin"`), mapearlo automáticamente
  if (authData.rol) {
    const map = { admin: 1, supervisor: 4, tecnico: 5, cliente: 3 };
    return map[authData.rol.toLowerCase()] || null;
  }

  return null;
};
// ❌ Cerrar sesión
export const clearAuth = () => localStorage.removeItem(AUTH_KEY);

// ✅ Saber si está logueado
export const isLoggedIn = () => {
  const token = getToken();
  console.log("DEBUG TOKEN:", token);
  return !!token;
};

// ✅ Helpers por rol
export const isAdmin = () => getRoleId() === 1;
export const isSupervisor = () => getRoleId() === 4;
export const isTecnico = () => getRoleId() === 5;
export const isCliente = () => getRoleId() === 3;

// ✅ Helper universal (más PRO)
export const hasRole = (roles = []) => roles.includes(getRoleId());

// ✅ Compatibilidad con lo anterior
export const canCreateVisita = () => hasRole([1, 4]); // Admin o Supervisor


