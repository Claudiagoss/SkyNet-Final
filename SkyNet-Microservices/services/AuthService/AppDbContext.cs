using Microsoft.EntityFrameworkCore;
using AuthService.Entidades;

namespace AuthService
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ======== ENTIDADES DE AUTENTICACIÓN ========
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Rol> Roles => Set<Rol>();
        public DbSet<Permiso> Permisos => Set<Permiso>();
        public DbSet<RolPermiso> RolPermisos => Set<RolPermiso>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de claves compuestas
            modelBuilder.Entity<RolPermiso>()
                .HasKey(rp => new { rp.RolId, rp.PermisoId });

            modelBuilder.Entity<RolPermiso>()
                .HasOne(rp => rp.Rol)
                .WithMany(r => r.RolPermisos)
                .HasForeignKey(rp => rp.RolId);

            modelBuilder.Entity<RolPermiso>()
                .HasOne(rp => rp.Permiso)
                .WithMany(p => p.RolPermisos)
                .HasForeignKey(rp => rp.PermisoId);
        }
    }
}
