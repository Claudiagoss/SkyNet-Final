using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Servicios;

public interface IAsignacionService
{
    Task<int?> ResolverUsuarioParaClienteAsync(int clienteId);
}

public class AsignacionService : IAsignacionService
{
    private readonly AppDbContext _db;
    private readonly int _usuarioSinAsignarId; // fallback opcional

    public AsignacionService(AppDbContext db, IConfiguration cfg)
    {
        _db = db;
        _usuarioSinAsignarId = cfg.GetValue<int?>("Asignaciones:UsuarioSinAsignarId") ?? 0;
    }

    public async Task<int?> ResolverUsuarioParaClienteAsync(int clienteId)
    {
        var cli = await _db.Clientes
            .Where(c => c.ClienteId == clienteId)
            .Select(c => new { c.ClienteId, c.Departamento })
            .FirstOrDefaultAsync();

        if (cli is null) return null;

        // 1) Asignación directa por Cliente
        var directa = await _db.ClienteAsignaciones
            .Where(a => a.ClienteId == clienteId &&
                        a.Tipo == TipoAsignacion.Directa &&
                        a.Activo && a.VigenteHasta == null)
            .OrderBy(a => a.VigenteDesde)
            .Select(a => (int?)a.UsuarioId)
            .FirstOrDefaultAsync();

        if (directa.HasValue) return directa;

        // 2) Asignación por Departamento
        if (!string.IsNullOrWhiteSpace(cli.Departamento))
        {
            var depto = await _db.ClienteAsignaciones
                .Where(a => a.Tipo == TipoAsignacion.PorDepartamento &&
                            a.Departamento == cli.Departamento &&
                            a.Activo && a.VigenteHasta == null)
                .OrderBy(a => a.VigenteDesde)
                .Select(a => (int?)a.UsuarioId)
                .FirstOrDefaultAsync();
            if (depto.HasValue) return depto;

            // 3) Geo-cobertura del técnico
            var cobertura = await _db.UsuarioCobertura
                .Where(c => c.Departamento == cli.Departamento && c.Activo)
                .OrderBy(c => c.Prioridad)
                .Select(c => (int?)c.UsuarioId)
                .FirstOrDefaultAsync();
            if (cobertura.HasValue) return cobertura;
        }

        // 4) Fallback
        return _usuarioSinAsignarId > 0 ? _usuarioSinAsignarId : null;
    }
}
