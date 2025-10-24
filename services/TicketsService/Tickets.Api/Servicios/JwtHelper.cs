using System.Security.Claims;

namespace Tickets.Api.Servicios
{
    public static class JwtHelper
    {
        // ================================================================
        // 🔹 OBTENER ID DEL USUARIO (claim "id")
        // ================================================================
        public static int ObtenerUsuarioId(HttpContext context)
        {
            // Buscar el claim correcto ("id" del token)
            var idClaim = context.User.FindFirst("id")?.Value;

            if (int.TryParse(idClaim, out int usuarioId))
                return usuarioId;

            // ⚠️ Si no se encuentra o no es numérico, log y retornar 0
            Console.WriteLine($"⚠️ Claim 'id' inválido o ausente. Valor: {idClaim}");
            return 0;
        }

        // ================================================================
        // 🔹 OBTENER ID DEL ROL (claim "rol")
        // ================================================================
        public static int ObtenerRolId(HttpContext context)
        {
            var rolClaim = context.User.FindFirst("rol")?.Value;

            if (int.TryParse(rolClaim, out int rolId))
                return rolId;

            Console.WriteLine($"⚠️ Claim 'rol' inválido o ausente. Valor: {rolClaim}");
            return 0;
        }

        // ================================================================
        // 🔹 OBTENER EMAIL (claim "email") — opcional
        // ================================================================
        public static string? ObtenerEmail(HttpContext context)
        {
            return context.User.FindFirst("email")?.Value;
        }
    }
}
