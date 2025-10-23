using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Clientes.Api;
using Clientes.Api.Servicios;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ===========================================
// 🔹 Swagger + Controllers
// ===========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Evita ciclos al serializar y mejora legibilidad JSON
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===========================================
// 🔹 DbContext
// ===========================================
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(configuration.GetConnectionString("Default")));

// ===========================================
// 🔹 Inyección de servicios (EmailService, etc.)
// ===========================================
builder.Services.AddScoped<IEmailService, EmailService>();

// ===========================================
// 🔹 Autenticación JWT (tokens del AuthService)
// ===========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = configuration["Jwt:Key"];
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("===== VERIFICANDO CONFIGURACIÓN JWT (CLIENTES.API) =====");
        Console.WriteLine($"Jwt:Key -> {key}");
        Console.WriteLine($"Jwt:Issuer -> {issuer}");
        Console.WriteLine($"Jwt:Audience -> {audience}");
        Console.ResetColor();

        if (string.IsNullOrEmpty(key))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ ERROR: Falta Jwt:Key en appsettings.json");
            Console.ResetColor();
            throw new Exception("JWT Key missing in configuration");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "SkyNetAuthServer",   // 👈 Igual que AuthService
            ValidAudience = "SkyNetApiClients", // 👈 Igual que AuthService
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("skynet-super-secret-key-2025-ultimate-strong-secret!!")
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

// ===========================================
// 🔹 CORS (para desarrollo y LAN)
// ===========================================
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
// 🔹 URL opcional de escucha (para LAN o móviles)
// ===========================================
// app.Urls.Add("http://0.0.0.0:5057"); // puedes habilitarla si usas acceso desde red local

// ===========================================
// 🔹 Middlewares base (orden correcto)
// ===========================================
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();  // 👈 antes que UseAuthorization
app.UseAuthorization();

// ===========================================
// 🔹 Swagger (solo en desarrollo)
// ===========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===========================================
// 🚀 Ejecutar controladores
// ===========================================
app.MapControllers();
app.Run();
