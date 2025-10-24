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

// =======================
// 🔹 Swagger
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =======================
// 🔹 Controllers
// =======================
builder.Services.AddControllers();

// =======================
// 🔹 DbContext
// =======================
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// =======================
// 🔹 AutoMapper
// =======================
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

// =======================
// 🔹 Autenticación JWT
// =======================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JwtKey"])
        ),
        ClockSkew = TimeSpan.Zero
    };
});

// =======================
// 🔹 Repositorios y Servicios
// =======================
builder.Services.AddScoped<IRepositorioTicket, RepositorioTicket>();
builder.Services.AddScoped<IRepositorioComentario, RepositorioComentario>();
builder.Services.AddScoped<IRepositorioCliente, RepositorioCliente>();
builder.Services.AddScoped<IRepositorioCatalogos, RepositorioCatalogos>();
builder.Services.AddScoped<IRepositorioUsuario, RepositorioUsuario>();
builder.Services.AddScoped<IAsignacionService, AsignacionService>();
builder.Services.AddScoped<IRepositorioAsignaciones, RepositorioAsignaciones>();
builder.Services.AddScoped<IRepositorioCobertura, RepositorioCobertura>();
builder.Services.AddScoped<IEmailService, EmailService>();

// =======================
// ✅ CORS (para desarrollo y LAN)
// =======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .AllowAnyOrigin()      // ✅ Permite cualquier origen (para Expo móvil)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// =======================
// ✅ Configuración de URL
// =======================
// 🔹 Esto permite acceso desde tu red (LAN)
app.Urls.Add("http://0.0.0.0:5058");

// =======================
// ✅ Middleware base
// =======================
app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

// 🔹 HTTPS opcional (puede interferir en móviles, desactívalo si da problemas)
app.UseHttpsRedirection();

// =======================
// 🔹 Swagger (solo en dev)
// =======================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =======================
// 🔹 Controllers y Endpoints agrupados bajo /api
// =======================
app.MapControllers();

var api = app.MapGroup("/api");

// Mapeo modular de endpoints
api.MapTickets();
api.MapComentarios();
api.MapClientes();
api.MapCatalogos();
api.MapUsuarios();
api.MapAsignaciones();

// =======================
// 🚀 Seed inicial (usuarios de prueba)
// =======================
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!ctx.Usuarios.Any())
    {
        ctx.Usuarios.AddRange(new[]
        {
            new Tickets.Api.Entidades.Usuario {
                Nombre="Administrador", Apellido="Root", Email="admin@sys.com",
                Username="admin", PasswordHash="1234", RolId=1, EsActivo=true
            },
            new Tickets.Api.Entidades.Usuario {
                Nombre="Supervisor", Apellido="Lopez", Email="sup@sys.com",
                Username="supervisor", PasswordHash="1234", RolId=4, EsActivo=true
            },
            new Tickets.Api.Entidades.Usuario {
                Nombre="Tecnico", Apellido="Ramos", Email="tec@sys.com",
                Username="tecnico", PasswordHash="1234", RolId=3, EsActivo=true
            }
        });
        ctx.SaveChanges();
    }
}

// =======================
// 🚀 Ejecutar la API
// =======================
app.Run();
