using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using Tickets.Api.DTOs.Usuarios;

namespace Tickets.Api.EndPoints
{
    public static class UsuarioEndpoint
    {
        public static RouteGroupBuilder MapUsuarios(this RouteGroupBuilder group)
        {
            group.MapPost("/usuarios", CrearUsuario);
            group.MapGet("/usuarios", ObtenerTodos);
            group.MapPut("/usuarios/{id:int}", ActualizarUsuario);
            group.MapDelete("/usuarios/{id:int}", EliminarUsuario);
            return group;
        }

        // ===============================================================
        // ✅ URL del AuthService centralizado
        // ===============================================================
        private const string AUTH_SERVICE_URL =
            "https://skynet-authservice-debtbpcjcxd7c5cw.canadacentral-01.azurewebsites.net/api/Usuarios";

        // ===============================================================
        // 🔹 CREAR USUARIO
        // ===============================================================
        static async Task<IResult> CrearUsuario(CrearUsuarioDTO dto, HttpClient client)
        {
            try
            {
                Console.WriteLine($"[TicketsService] 🔁 Enviando creación de usuario a AuthService: {dto.Email}");

                var res = await client.PostAsJsonAsync(AUTH_SERVICE_URL, dto);

                if (!res.IsSuccessStatusCode)
                {
                    var err = await res.Content.ReadAsStringAsync();
                    Console.WriteLine($"❌ Error AuthService: {err}");
                    return Results.Problem($"Error al crear usuario: {err}", statusCode: (int)res.StatusCode);
                }

                var data = await res.Content.ReadFromJsonAsync<object>();
                return Results.Created("/usuarios", data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error proxy al AuthService: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }

        // ===============================================================
        // 🔹 OBTENER TODOS LOS USUARIOS
        // ===============================================================
        static async Task<IResult> ObtenerTodos(HttpClient client)
        {
            try
            {
                var usuarios = await client.GetFromJsonAsync<List<GetAllUsuariosDTO>>(AUTH_SERVICE_URL);
                return Results.Ok(usuarios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error obteniendo usuarios desde AuthService: {ex.Message}");
                return Results.Problem("No se pudieron obtener los usuarios.");
            }
        }

        // ===============================================================
        // 🔹 ACTUALIZAR USUARIO
        // ===============================================================
        static async Task<IResult> ActualizarUsuario(int id, ActualizarUsuarioDTO dto, HttpClient client)
        {
            try
            {
                var res = await client.PutAsJsonAsync($"{AUTH_SERVICE_URL}/{id}", dto);

                if (!res.IsSuccessStatusCode)
                {
                    var err = await res.Content.ReadAsStringAsync();
                    Console.WriteLine($"❌ Error actualizando en AuthService: {err}");
                    return Results.Problem(err, statusCode: (int)res.StatusCode);
                }

                return Results.Ok(new { message = "Usuario actualizado correctamente (vía AuthService)" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error proxy al AuthService: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }

        // ===============================================================
        // 🔹 ELIMINAR USUARIO
        // ===============================================================
        static async Task<IResult> EliminarUsuario(int id, HttpClient client)
        {
            try
            {
                var res = await client.DeleteAsync($"{AUTH_SERVICE_URL}/{id}");

                if (!res.IsSuccessStatusCode)
                {
                    var err = await res.Content.ReadAsStringAsync();
                    Console.WriteLine($"❌ Error eliminando en AuthService: {err}");
                    return Results.Problem(err, statusCode: (int)res.StatusCode);
                }

                return Results.Ok(new { message = "Usuario eliminado correctamente (vía AuthService)" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error proxy al AuthService: {ex.Message}");
                return Results.Problem(ex.Message);
            }
        }
    }
}
