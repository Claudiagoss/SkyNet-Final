using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Tickets.Api;
using Tickets.Api.DTOs.Auth;
using Tickets.Api.Entidades;

namespace Tickets.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.Username == dto.Username);

            if (usuario is null)
                return Unauthorized("❌ Usuario no encontrado");

            if (usuario.PasswordHash != dto.Password)
                return Unauthorized("❌ Contraseña incorrecta");

            // 🔍 Obtenemos el rol real
            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.RolId == usuario.RolId);
            string rolNombre = rol?.Nombre ?? "sin-rol";

            // ✅ Generar JWT con RolId numérico
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["JwtKey"]);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()), // ID real del usuario
                new Claim(ClaimTypes.Name, usuario.Username),
                new Claim(ClaimTypes.Role, usuario.RolId.ToString()) // RolId numérico (1,4,5)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(4),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                usuario = usuario.Username,
                usuarioId = usuario.UsuarioId, // 👈 añade esto
                rol = rolNombre,
                rolId = usuario.RolId
            });
        }
    }
}
