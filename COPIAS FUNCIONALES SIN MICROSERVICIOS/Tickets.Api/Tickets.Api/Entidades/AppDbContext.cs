using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ========== AUTH ==========
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Rol> Roles => Set<Rol>();
        public DbSet<Permiso> Permisos => Set<Permiso>();
        public DbSet<RolPermiso> RolPermisos => Set<RolPermiso>();

        // ========== TICKETS / CLIENTES ==========
        public DbSet<Cliente> Clientes => Set<Cliente>();
        public DbSet<EstadoTicket> Estados => Set<EstadoTicket>();
        public DbSet<PrioridadTicket> Prioridades => Set<PrioridadTicket>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<Comentario> Comentarios => Set<Comentario>();
        public DbSet<ReporteVisita> ReportesVisita => Set<ReporteVisita>();


        // ========== CARTERA / COBERTURA ==========
        public DbSet<ClienteAsignacion> ClienteAsignaciones => Set<ClienteAsignacion>();
        public DbSet<UsuarioCobertura> UsuarioCobertura => Set<UsuarioCobertura>();

        protected override void OnModelCreating(ModelBuilder model)
        {
            // ================================
            //  USUARIOS Y ROLES (auth)
            // ================================
            model.Entity<Usuario>(e =>
            {
                e.ToTable("Usuario", "auth").HasComment("Usuarios del sistema (auth).");
                e.HasKey(x => x.UsuarioId);

                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                e.Property(x => x.Apellido).IsRequired().HasMaxLength(100);
                e.Property(x => x.Email).IsRequired().HasMaxLength(150);
                e.Property(x => x.Telefono).IsRequired().HasMaxLength(50);
                e.Property(x => x.Username).IsRequired().HasMaxLength(100);
                e.Property(x => x.PasswordHash).IsRequired().HasMaxLength(200);
                e.Property(x => x.EsActivo).HasDefaultValue(true);
                e.Property(x => x.CreadoEl).HasDefaultValueSql("SYSUTCDATETIME()");

                e.HasIndex(x => x.Email).IsUnique();
                e.HasIndex(x => x.Username).IsUnique();

                e.HasOne<Rol>()
                    .WithMany()
                    .HasForeignKey(x => x.RolId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            model.Entity<Rol>(e =>
            {
                e.ToTable("Rol", "auth");
                e.HasKey(x => x.RolId);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            });

            model.Entity<Permiso>(e =>
            {
                e.ToTable("Permiso", "auth");
                e.HasKey(x => x.PermisoId);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            });

            model.Entity<RolPermiso>(e =>
            {
                e.ToTable("RolPermiso", "auth");
                e.HasKey(x => x.RolPermisoId);
                e.HasIndex(x => new { x.RolId, x.PermisoId }).IsUnique();
            });

            // ================================
            //  CLIENTES Y TICKETS (tickets)
            // ================================
            model.Entity<Cliente>(e =>
            {
                e.ToTable("Cliente", "tickets");
                e.HasKey(x => x.ClienteId);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(150);
                e.Property(x => x.Email).HasMaxLength(200);
                e.Property(x => x.Contacto).HasMaxLength(150);
                e.Property(x => x.Telefono).HasMaxLength(50);
                e.Property(x => x.Direccion).HasMaxLength(300);
                e.Property(x => x.Departamento).HasMaxLength(100);

                // 👇 Añade esto:
                e.Property(x => x.CreadoEl).HasDefaultValueSql("SYSUTCDATETIME()");
            });

            model.Entity<EstadoTicket>(e =>
            {
                e.ToTable("EstadoTicket", "catalog");
                e.HasKey(x => x.EstadoId);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            });

            model.Entity<PrioridadTicket>(e =>
            {
                e.ToTable("PrioridadTicket", "catalog");
                e.HasKey(x => x.PrioridadId);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            });

            model.Entity<Ticket>(e =>
            {
                e.ToTable("Ticket", "tickets");
                e.HasKey(x => x.TicketId);
                e.Property(x => x.Titulo).IsRequired().HasMaxLength(150);
                e.Property(x => x.Descripcion).HasMaxLength(2000);
                e.Property(x => x.ReporteFinal).HasMaxLength(3000);
            });

            // Relaciones FK limpias (sin _1)
            model.Entity<Ticket>()
                .HasOne(t => t.Cliente)
                .WithMany()
                .HasForeignKey(t => t.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            model.Entity<Ticket>()
                .HasOne(t => t.Estado)
                .WithMany()
                .HasForeignKey(t => t.EstadoId)
                .OnDelete(DeleteBehavior.Restrict);

            model.Entity<Ticket>()
                .HasOne(t => t.Prioridad)
                .WithMany()
                .HasForeignKey(t => t.PrioridadId)
                .OnDelete(DeleteBehavior.Restrict);

            // ================================
            //  COBERTURA Y ASIGNACIONES
            // ================================
            model.Entity<UsuarioCobertura>(e =>
            {
                e.ToTable("UsuarioCobertura", "auth");
                e.HasKey(x => x.UsuarioCoberturaId);
            });

            model.Entity<ClienteAsignacion>(e =>
            {
                e.ToTable("ClienteAsignacion", "tickets");
                e.HasKey(x => x.ClienteAsignacionId);
            });

            // ================================
            //  REPORTE VISITA
            // ================================
            model.Entity<ReporteVisita>(e =>
            {
                // 👇 Nombre de tabla y esquema correctos según tu SQL Server
                e.ToTable("ReportesVisita", "tickets");

                e.HasKey(x => x.ReporteVisitaId);

                // 🔧 Mapeo de columnas y restricciones
                e.Property(x => x.ClienteEmail)
                    .IsRequired()
                    .HasMaxLength(200);

                e.Property(x => x.Asunto)
                    .IsRequired()
                    .HasMaxLength(200);

                e.Property(x => x.Contenido)
                    .HasColumnType("nvarchar(max)");

                // 🔗 Relación con Ticket (1:N)
                e.HasOne(x => x.Ticket)
                    .WithMany()
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
