using System.Net.Http.Headers;
using System.Net.Http.Json;
using Tickets.Api.Entidades;

namespace Tickets.Api.Servicios
{
    public interface IAuthClientService
    {
        Task<Dictionary<int, string>> ObtenerDiccionarioUsuariosAsync(string? token = null);
        Task<UsuarioInfo?> ObtenerUsuarioPorIdAsync(int usuarioId, string? token = null);
    }

    public class AuthClientService : IAuthClientService
    {
        private readonly HttpClient _http;

        public AuthClientService(HttpClient http)
        {
            _http = http;
            _http.BaseAddress = new Uri("http://localhost:5090/api/usuarios/");
        }

        // ================================================================
        // 🔹 Devuelve todos los usuarios (requiere token JWT)
        // ================================================================
        public async Task<Dictionary<int, string>> ObtenerDiccionarioUsuariosAsync(string? token = null)
        {
            try
            {
                if (!string.IsNullOrEmpty(token))
                {
                    _http.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Bearer", token);
                }

                var usuarios = await _http.GetFromJsonAsync<List<UsuarioInfo>>("");
                return usuarios?
                    .ToDictionary(u => u.UsuarioId, u => $"{u.Nombre} {u.Apellido}".Trim())
                    ?? new Dictionary<int, string>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error al consultar usuarios del AuthService: {ex.Message}");
                return new Dictionary<int, string>();
            }
        }

        // ================================================================
        // 🔹 Obtener un usuario por su ID (requiere token JWT)
        // ================================================================
        public async Task<UsuarioInfo?> ObtenerUsuarioPorIdAsync(int usuarioId, string? token = null)
        {
            try
            {
                if (!string.IsNullOrEmpty(token))
                {
                    _http.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Bearer", token);
                }

                return await _http.GetFromJsonAsync<UsuarioInfo>($"{usuarioId}");
            }
            catch
            {
                return null;
            }
        }
    }

    public class UsuarioInfo
    {
        public int UsuarioId { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Email { get; set; }
    }
}
