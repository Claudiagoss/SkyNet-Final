using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using AuthService;
using AuthService.Repositorios;

var builder = WebApplication.CreateBuilder(args);

// ===========================================
// ✅ Cargar configuración dinámica (según entorno)
// ===========================================
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

var configuration = builder.Configuration;

// ===========================================
// ✅ Configurar DbContext (SQL Server)
// ===========================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// ===========================================
// ✅ Registrar repositorios y servicios
// ===========================================
builder.Services.AddScoped<IRepositorioUsuario, RepositorioUsuario>();

// ===========================================
// ✅ Configurar autenticación JWT
// ===========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = configuration["Jwt:Key"];
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("===== VERIFICANDO CONFIGURACIÓN JWT =====");
        Console.WriteLine($"Jwt:Key -> {key}");
        Console.WriteLine($"Jwt:Issuer -> {issuer}");
        Console.WriteLine($"Jwt:Audience -> {audience}");
        Console.ResetColor();

        if (string.IsNullOrEmpty(key))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ ERROR: La clave JWT (Jwt:Key) no se encontró en configuración");
            Console.ResetColor();
            throw new Exception("JWT Key missing in configuration");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });

// ===========================================
// ✅ Configuración general de la aplicación
// ===========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ✅ Swagger disponible también en Producción
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SkyNet AuthService API",
        Version = "v1",
        Description = "Microservicio de autenticación desplegado en Azure"
    });
});

// ===========================================
// 🔹 CORS (Producción)
// ===========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("SkyNetCors", policy =>
        policy
            .SetIsOriginAllowed(origin =>
                new[]
                {
                    "https://claudiagosskynet.netlify.app",
                    "https://cosmic-sfogliatella-c14f60.netlify.app",
                    "https://euphonious-lokum-0e10c5.netlify.app",
                    "http://localhost:5173"
                }.Contains(origin)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});
var app = builder.Build();

// ===========================================
// ✅ Middlewares globales
// ===========================================

// Mostrar Swagger en todos los entornos
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AuthService API v1");
    c.RoutePrefix = string.Empty; // Muestra Swagger directamente en la raíz "/"
});
app.UseCors("SkyNetCors");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();



// ===========================================
// ✅ Endpoint raíz (para pruebas de Azure)
// ===========================================
app.MapGet("/", () => Results.Ok("✅ AuthService desplegado correctamente en Azure y listo para recibir solicitudes."));

app.Run();
