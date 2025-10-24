using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Tickets.Api;
using Tickets.Api.EndPoints;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 🔹 CONFIGURACIÓN DE BASE DE DATOS
// ============================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================================
// 🔹 CONFIGURACIÓN JWT
// ============================================================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

// ============================================================
// 🔹 CORS
// ============================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ============================================================
// 🔹 CONTROLADORES Y ENDPOINTS
// ============================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ============================================================
// 🔹 PIPELINE HTTP
// ============================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

// ============================================================
// 🔹 MAPEO DE ENDPOINTS DE TICKETS
// ============================================================
app.MapGroup("/api")
   .MapTickets()
   .WithTags("Tickets API");

// ============================================================
app.Run();
