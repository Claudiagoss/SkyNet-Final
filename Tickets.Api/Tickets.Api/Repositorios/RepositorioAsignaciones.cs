using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios
{
    public class RepositorioAsignaciones : IRepositorioAsignaciones
    {
        private readonly AppDbContext _db;

        public RepositorioAsignaciones(AppDbContext db)
        {
            _db = db;
        }

        // ✅ 1. Asignar cliente directamente a un usuario
        public async Task<int> AsignarDirectoAsync(int clienteId, int usuarioId)
        {
            var asignacion = new ClienteAsignacion
            {
                ClienteId = clienteId,
                UsuarioId = usuarioId,
                Tipo = TipoAsignacion.Directa,
                Activo = true,
                VigenteDesde = DateTime.UtcNow
            };

            await _db.ClienteAsignaciones.AddAsync(asignacion);
            await _db.SaveChangesAsync();

            return asignacion.ClienteAsignacionId;
        }

        // ✅ 2. Asignar todos los clientes de un departamento
        public async Task<int> AsignarPorDepartamentoAsync(string departamento, int usuarioId)
        {
            var asignacion = new ClienteAsignacion
            {
                Departamento = departamento,
                UsuarioId = usuarioId,
                Tipo = TipoAsignacion.PorDepartamento,
                Activo = true,
                VigenteDesde = DateTime.UtcNow
            };

            await _db.ClienteAsignaciones.AddAsync(asignacion);
            await _db.SaveChangesAsync();

            return asignacion.ClienteAsignacionId;
        }

        // ✅ 3. Cerrar / Inactivar una asignación
        public async Task CerrarAsignacionAsync(int clienteAsignacionId)
        {
            var asignacion = await _db.ClienteAsignaciones
                .FirstOrDefaultAsync(a => a.ClienteAsignacionId == clienteAsignacionId);

            if (asignacion != null)
            {
                asignacion.Activo = false;
                asignacion.VigenteHasta = DateTime.UtcNow;

                _db.ClienteAsignaciones.Update(asignacion);
                await _db.SaveChangesAsync();
            }
        }
    }
}
