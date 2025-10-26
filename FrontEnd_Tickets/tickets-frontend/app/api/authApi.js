// =============================================================
// 🔐 AUTH API — SkyNet Frontend
// =============================================================
import { authApi } from "../config/axios";
import { isAxiosError } from "axios";

export const login = async ({ username, password }) => {
  try {
    const { data } = await authApi.post("/auth/login", { username, password });
    return data; // { token, usuario, rol }
  } catch (e) {
    console.error("❌ Error en login:", e);
    if (isAxiosError(e) && e.response)
      throw new Error(e.response.data?.message || "Error al iniciar sesión");
    throw e;
  }
};
