using Microsoft.EntityFrameworkCore;
using Tickets.Api.DTOs.Auth;
using Tickets.Api.Entidades;
using Tickets.Api.Helpers;

namespace Tickets.Api.Servicios
{
    public interface IAuthService
    {
        Task<LoginResponseDTO?> LoginAsync(LoginDTO dto);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<LoginResponseDTO?> LoginAsync(LoginDTO dto)
        {
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.Username == dto.Username && x.EsActivo == true);

            if (user == null) return null;

            // ⚠ Verificación de contraseña (luego lo cambiamos a hash real)
            if (user.PasswordHash != dto.Password) return null;

            // ✅ Obtener rol desde tabla Roles
            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.RolId == user.RolId);
            string rolNombre = rol?.Nombre ?? "sin-rol";

            // ✅ Obtener clave JWT de manera segura
            var secret = _config["JwtKey"] ?? throw new Exception("JwtKey no está configurado en appsettings.json");

            // ✅ Generar token
            string token = JwtGenerator.GenerateToken(user, rolNombre, secret);

            return new LoginResponseDTO
            {
                Token = token,
                Username = user.Username,
                RolId = user.RolId,
                RolNombre = rolNombre
            };
        }


    }
}
