using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Tickets.Api.Entidades;

namespace Tickets.Api.Seed
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // 🟢 Crear Roles si no existen
            string[] roles = { "admin", "supervisor", "tecnico" };

            foreach (var roleName in roles)
            {
                if (!db.Roles.Any(r => r.Nombre == roleName))
                {
                    db.Roles.Add(new Rol
                    {
                        Nombre = roleName,
                        Descripcion = $"Rol generado automáticamente: {roleName}",
                        CreadoEl = DateTime.UtcNow
                    });
                }
            }

            await db.SaveChangesAsync();

            // 🟢 Crear usuario Admin por defecto si no existe
            string adminEmail = "admin@system.com";
            if (!db.Usuarios.Any(u => u.Email == adminEmail))
            {
                db.Usuarios.Add(new Usuario
                {
                    Nombre = "Admin",
                    Apellido = "System",
                    Email = adminEmail,
                    Telefono = "00000000",
                    Username = "admin",
                    PasswordHash = "123456", // ⚠ IMPORTANTE: luego lo encriptamos
                    RolId = db.Roles.First(r => r.Nombre == "admin").RolId,
                    CreadoEl = DateTime.UtcNow,
                    EsActivo = true
                });

                await db.SaveChangesAsync();
            }
        }
    }
}
