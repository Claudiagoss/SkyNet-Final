using Tickets.Api.Servicios;

namespace Tickets.Api.EndPoints
{
    public static class UsuariosAuthEndpoint
    {
        public static RouteGroupBuilder MapUsuariosAuth(this RouteGroupBuilder group)
        {
            group.MapGet("/usuarios", async (HttpContext context, IAuthClientService authClient) =>
            {
                // 📥 Extraer token del encabezado recibido
                var authHeader = context.Request.Headers["Authorization"].ToString();
                var token = authHeader?.Replace("Bearer ", "");

                Console.WriteLine("🔄 Reenviando petición de usuarios al AuthService con token...");

                var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync(token);

                if (usuarios == null || usuarios.Count == 0)
                    return Results.NotFound(new { message = "No se encontraron usuarios en AuthService" });

                return Results.Ok(usuarios);
            });

            return group;
        }
    }
}
