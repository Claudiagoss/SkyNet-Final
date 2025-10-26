using System.Net.Http.Json;
using Tickets.Api.Entidades;

namespace Tickets.Api.Servicios
{
    public interface IAuthClientService
    {
        Task<Dictionary<int, string>> ObtenerDiccionarioUsuariosAsync();
        Task<UsuarioInfo?> ObtenerUsuarioPorIdAsync(int usuarioId);
    }

    public class AuthClientService : IAuthClientService
    {
        private readonly HttpClient _http;

        public AuthClientService(HttpClient http)
        {
            _http = http;
            // 🔹 Si tu AuthService corre en otro puerto, cámbialo aquí:
            _http.BaseAddress = new Uri("http://localhost:5057/api/usuarios");
        }

        // ================================================================
        // 🔹 Devuelve todos los usuarios como diccionario (id → nombre)
        // ================================================================
        public async Task<Dictionary<int, string>> ObtenerDiccionarioUsuariosAsync()
        {
            try
            {
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
        // 🔹 Obtener un usuario por su ID
        // ================================================================
        public async Task<UsuarioInfo?> ObtenerUsuarioPorIdAsync(int usuarioId)
        {
            try
            {
                return await _http.GetFromJsonAsync<UsuarioInfo>($"/{usuarioId}");
            }
            catch
            {
                return null;
            }
        }
    }

    // ================================================================
    // 🔹 DTO local para los datos del AuthService
    // ================================================================
    public class UsuarioInfo
    {
        public int UsuarioId { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Email { get; set; }
    }
}
