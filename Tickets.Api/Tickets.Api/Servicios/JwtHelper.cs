using System.Security.Claims;

namespace Tickets.Api.Servicios
{
    public static class JwtHelper
    {
        public static int ObtenerUsuarioId(HttpContext context)
        {
            var claim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        public static int ObtenerRolId(HttpContext context)
        {
            var claim = context.User.FindFirst(ClaimTypes.Role);
            return claim != null && int.TryParse(claim.Value, out int rolId) ? rolId : 0;
        }
    }
}
