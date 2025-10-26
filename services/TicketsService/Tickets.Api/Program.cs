using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // 👈 agregado
using System.Text;
using Tickets.Api;
using Tickets.Api.EndPoints;
using Tickets.Api.Perfiles;
using Tickets.Api.Repositorios;
using Tickets.Api.Servicios;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// ===========================================
// 🔹 Cargar configuración (appsettings.json + variables de entorno Azure)
// ===========================================
configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables(); // ✅ Azure siempre sobreescribe lo que haya en JSON

// ===========================================
// 🔹 Swagger con Autorización JWT
// ===========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SkyNet Tickets API",
        Version = "v1",
        Description = "Microservicio de gestión de tickets técnicos (SkyNet S.A.)",
        Contact = new OpenApiContact
        {
            Name = "Soporte SkyNet",
            Email = "skynetsoportesa@gmail.com"
        }
    });

    // 👇 botón Authorize y esquema Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Ingrese su token JWT. Ejemplo: **Bearer {token}**",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ===========================================
// 🔹 Controllers
// ===========================================
builder.Services.AddControllers();

// ===========================================
// 🔹 Base de datos SQL Azure
// ===========================================
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var conn = configuration.GetConnectionString("Default");
    if (string.IsNullOrEmpty(conn))
        throw new Exception("❌ No se encontró la cadena de conexión 'Default' en configuración.");
    opt.UseSqlServer(conn);
});

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

        if (string.IsNullOrEmpty(key))
            throw new Exception("❌ JWT Key missing in configuration");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer ?? "SkyNetAuthServer",
            ValidAudience = audience ?? "SkyNetApiClients",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
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
builder.Services.AddScoped<IAsignacionService, AsignacionService>();
builder.Services.AddScoped<IRepositorioAsignaciones, RepositorioAsignaciones>();
builder.Services.AddScoped<IRepositorioCobertura, RepositorioCobertura>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ===========================================
// 🔹 CORS
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
// 🔹 Middleware principal
// ===========================================
app.UseCors("SkyNetCors");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// ===========================================
// 🔹 Swagger (mantiene tu condición original)
// ===========================================
if (configuration["EnableSwagger"]?.ToLower() == "true" || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SkyNet Tickets API v1");
        // Mantengo tu configuración de ruta
    });
}

// ===========================================
// 🔹 Endpoints agrupados bajo /api
// ===========================================
var api = app.MapGroup("/api");
api.MapTickets();
api.MapComentarios();
api.MapClientes();
api.MapCatalogos();
api.MapAsignaciones();

// ===========================================
// 🔹 Endpoint raíz "/" para Azure
// ===========================================
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

// ===========================================
// 🔹 Logging y diagnósticos para Azure
// ===========================================
Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "logs"));

// ===========================================
// 🚀 Ejecutar la API
// ===========================================IRepositorioUsuario
app.MapControllers();
app.Run();
