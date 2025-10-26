using System.Security.Claims;

namespace Tickets.Api.Servicios
{
    public static class JwtHelper
    {
        /// <summary>
        /// Obtiene el ID numérico del usuario desde el token JWT.
        /// </summary>
        public static int ObtenerUsuarioId(HttpContext context)
        {
            try
            {
                // 🔹 Busca primero el claim "id" (usado en tu AuthService)
                var idClaim = context.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

                // 🔹 Si no existe, intenta buscar el estándar "NameIdentifier"
                if (string.IsNullOrEmpty(idClaim))
                    idClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(idClaim))
                    throw new Exception("No se encontró el claim 'id' o 'NameIdentifier' en el token JWT.");

                if (int.TryParse(idClaim, out int userId))
                    return userId;

                throw new FormatException($"El claim de usuario ('{idClaim}') no es un número válido.");
            }
            catch (Exception ex)
            {
                // 🔹 Log para diagnóstico en Azure (Application Insights o consola)
                Console.WriteLine($"[JwtHelper] Error al obtener el UsuarioId: {ex.Message}");
                return 0; // Evita crash, devuelve 0 por seguridad
            }
        }

        /// <summary>
        /// Obtiene el rol numérico del usuario desde el token JWT.
        /// </summary>
        public static int ObtenerRolId(HttpContext context)
        {
            try
            {
                // 🔹 Busca el claim "rol" o el estándar "Role"
                var rolClaim = context.User.Claims.FirstOrDefault(c => c.Type == "rol")?.Value
                               ?? context.User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(rolClaim))
                    throw new Exception("No se encontró el claim 'rol' o 'Role' en el token JWT.");

                if (int.TryParse(rolClaim, out int rolId))
                    return rolId;

                throw new FormatException($"El claim de rol ('{rolClaim}') no es un número válido.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[JwtHelper] Error al obtener el RolId: {ex.Message}");
                return 0;
            }
        }
    }
}
