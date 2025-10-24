using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioCobertura : IRepositorioCobertura
{
    private readonly AppDbContext _db;
    public RepositorioCobertura(AppDbContext db) => _db = db;

    public async Task<int> CrearCoberturaAsync(int usuarioId, string departamento, int prioridad)
    {
        var c = new UsuarioCobertura
        {
            UsuarioId = usuarioId,
            Departamento = departamento,
            Prioridad = prioridad,
            Activo = true
        };
        _db.Add(c);
        await _db.SaveChangesAsync();
        return c.UsuarioCoberturaId;
    }

    public async Task<List<UsuarioCobertura>> ListarCoberturaAsync(string? departamento = null)
    {
        var q = _db.UsuarioCobertura.AsQueryable();
        if (!string.IsNullOrWhiteSpace(departamento))
            q = q.Where(x => x.Departamento == departamento);
        return await q.OrderBy(x => x.Departamento).ThenBy(x => x.Prioridad).ToListAsync();
    }

    public async Task DesactivarCoberturaAsync(int usuarioCoberturaId)
    {
        var c = await _db.UsuarioCobertura.FindAsync(usuarioCoberturaId);
        if (c is null) return;
        c.Activo = false;
        await _db.SaveChangesAsync();
    }
}
