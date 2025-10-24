using Microsoft.EntityFrameworkCore;
using Clientes.Api.Entidades;

namespace Clientes.Api;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
    public DbSet<Reporte> Reportes => Set<Reporte>();
}
