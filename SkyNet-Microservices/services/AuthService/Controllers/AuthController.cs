using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService;
using AuthService.Entidades;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ============================
        // 🔹 LOGIN
        // ============================
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Usuarios
                .FirstOrDefault(u => u.Username == request.Username && u.PasswordHash == request.Password);

            if (user == null || !user.EsActivo)
                return Unauthorized("Usuario o contraseña incorrectos");

            // 🔍 Depuración: mostrar configuración JWT
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("===== DEPURACIÓN JWT =====");
            Console.WriteLine($"Jwt:Key -> {_config["Jwt:Key"]}");
            Console.WriteLine($"Jwt:Issuer -> {_config["Jwt:Issuer"]}");
            Console.WriteLine($"Jwt:Audience -> {_config["Jwt:Audience"]}");
            Console.ResetColor();

            // 🔑 Generar el token
            var token = GenerateJwtToken(user);

            // 🔹 Buscar el rol (si tienes tabla de roles)
            var rol = _context.Roles.FirstOrDefault(r => r.RolId == user.RolId);

            // ✅ Respuesta adaptada al frontend
            return Ok(new
            {
                token,
                usuario = new
                {
                    user.UsuarioId,
                    user.Nombre,
                    user.Apellido,
                    user.Email,
                    user.Username
                },
                rol = new
                {
                    rolId = user.RolId,
                    nombre = rol?.Nombre ?? "SinRol"
                }
            });
        }

        // ============================
        // 🔹 GENERAR TOKEN JWT
        // ============================
        private string GenerateJwtToken(Usuario user)
        {
            var key = _config["Jwt:Key"];
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ ERROR: Faltan valores en la configuración JWT");
                Console.ResetColor();
                throw new Exception("JWT configuration missing in appsettings.json");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("id", user.UsuarioId.ToString()),
                new Claim("rol", user.RolId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ============================
        // 🔹 CLASE AUXILIAR
        // ============================
        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
