using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Tickets.Api;
using Tickets.Api.EndPoints;
using Tickets.Api.Perfiles;
using Tickets.Api.Repositorios;
using Tickets.Api.Servicios;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ===========================================
// 🔹 Configuración general
// ===========================================
configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// ===========================================
// 🔹 Swagger
// ===========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===========================================
// 🔹 Controllers
// ===========================================
builder.Services.AddControllers();

// ===========================================
// 🔹 DbContext
// ===========================================
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(configuration.GetConnectionString("Default")));

// ===========================================
// 🔹 AutoMapper
// ===========================================
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

// ===========================================
// 🔹 Autenticación JWT (Tokens del AuthService)
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
            Console.WriteLine("❌ ERROR: No se encontró Jwt:Key en appsettings.json");
            Console.ResetColor();
            throw new Exception("JWT Key missing in configuration");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "SkyNetAuthServer",        // 👈 Fijo para todos los microservicios
            ValidAudience = "SkyNetApiClients",      // 👈 Fijo para todos los microservicios
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("skynet-super-secret-key-2025-ultimate-strong-secret!!")
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

// ===========================================
// 🔹 Repositorios y Servicios
// ===========================================
builder.Services.AddScoped<IRepositorioTicket, RepositorioTicket>();
builder.Services.AddScoped<IRepositorioComentario, RepositorioComentario>();
builder.Services.AddScoped<IRepositorioCliente, RepositorioCliente>();
builder.Services.AddScoped<IRepositorioCatalogos, RepositorioCatalogos>();
builder.Services.AddHttpClient<IAuthClientService, AuthClientService>();

//builder.Services.AddScoped<IRepositorioUsuario, RepositorioUsuario>();
builder.Services.AddScoped<IAsignacionService, AsignacionService>();
builder.Services.AddScoped<IRepositorioAsignaciones, RepositorioAsignaciones>();
builder.Services.AddScoped<IRepositorioCobertura, RepositorioCobertura>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ===========================================
// 🔹 CORS
// ===========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ===========================================
// 🔹 URL de escucha (LAN / local)
// ===========================================
app.Urls.Add("http://0.0.0.0:5058");

// ===========================================
// 🔹 Middlewares principales
// ===========================================
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();   // 👈 OBLIGATORIO antes de UseAuthorization
app.UseAuthorization();

// ===========================================
// 🔹 Swagger solo en desarrollo
// ===========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===========================================
// 🔹 Endpoints agrupados bajo /api
// ===========================================
var api = app.MapGroup("/api");
api.MapTickets();
api.MapComentarios();
api.MapClientes();
api.MapCatalogos();
//api.MapUsuarios();
api.MapAsignaciones();

// ===========================================
// 🚀 Seed inicial (usuarios de prueba)
// ===========================================


// ===========================================
// 🚀 Ejecutar la API
// ===========================================
app.MapControllers();
app.Run();
