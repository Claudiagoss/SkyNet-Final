using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AuthService;

var builder = WebApplication.CreateBuilder(args);

// ===========================================
// ✅ Cargar configuración desde appsettings.json
// ===========================================
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

var configuration = builder.Configuration;

// ===========================================
// ✅ Configurar DbContext (SQL Server)
// ===========================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// ===========================================
// ✅ Configurar autenticación JWT
// ===========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = configuration["Jwt:Key"];
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];

        // 🔍 Validación de seguridad y log de depuración
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("===== VERIFICANDO CONFIGURACIÓN JWT =====");
        Console.WriteLine($"Jwt:Key -> {key}");
        Console.WriteLine($"Jwt:Issuer -> {issuer}");
        Console.WriteLine($"Jwt:Audience -> {audience}");
        Console.ResetColor();

        if (string.IsNullOrEmpty(key))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ ERROR: La clave JWT (Jwt:Key) no se encontró en appsettings.json");
            Console.ResetColor();
            throw new Exception("JWT Key missing in configuration");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "SkyNetAuthServer",   // 👈 importante
            ValidAudience = "SkyNetApiClients", // 👈 importante
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });

// ===========================================
// ✅ Configuración general de la aplicación
// ===========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// =======================
// 🔹 CORS (para desarrollo y LAN)
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
var app = builder.Build();

// ===========================================
// ✅ Middlewares
// ===========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowAll");

app.MapControllers();

// ===========================================
// ✅ Ejecutar aplicación
// ===========================================
app.Run();
