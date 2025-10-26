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
// ⚠️ Solo cámbialo cuando tengamos lista la cadena SQL de Azure
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(configuration.GetConnectionString("Default")));

// ===========================================
// 🔹 AutoMapper
// ===========================================
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

// ===========================================
// 🔹 Autenticación JWT
// ===========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = configuration["Jwt:Key"];
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.Zero
        };
    });

// ===========================================
// 🔹 Servicios y Repositorios
// ===========================================
builder.Services.AddScoped<IRepositorioTicket, RepositorioTicket>();
builder.Services.AddScoped<IRepositorioComentario, RepositorioComentario>();
builder.Services.AddScoped<IRepositorioCliente, RepositorioCliente>();
builder.Services.AddScoped<IRepositorioCatalogos, RepositorioCatalogos>();
builder.Services.AddHttpClient<IAuthClientService, AuthClientService>();
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
// 🔹 Middlewares
// ===========================================
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// ===========================================
// 🔹 Swagger habilitado también en producción
// ===========================================
var enableSwagger = configuration.GetValue<bool>("EnableSwagger");
if (app.Environment.IsDevelopment() || enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===========================================
// 🔹 Endpoint raíz de prueba
// ===========================================
app.MapGet("/", () => Results.Ok("✅ Tickets.Api running on Azure"));

// ===========================================
// 🔹 Endpoints agrupados bajo /api
// ===========================================
var api = app.MapGroup("/api");
api.MapTickets();
api.MapComentarios();
api.MapClientes();
api.MapCatalogos();
api.MapAsignaciones();

app.MapControllers();
app.Run();
