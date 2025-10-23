using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioCliente : IRepositorioCliente
{
    private readonly AppDbContext ctx;
    public RepositorioCliente(AppDbContext ctx) => this.ctx = ctx;

    public async Task<int> Crear(Cliente c)
    {
        ctx.Clientes.Add(c);
        await ctx.SaveChangesAsync();
        return c.ClienteId;
    }

    public Task<List<Cliente>> ObtenerTodos() =>
        ctx.Clientes.AsNoTracking().OrderByDescending(x => x.ClienteId).ToListAsync();

    public Task<Cliente?> ObtenerPorId(int id) =>
        ctx.Clientes.AsNoTracking().FirstOrDefaultAsync(x => x.ClienteId == id);

    public async Task Actualizar(Cliente c)
    {
        ctx.Clientes.Update(c);
        await ctx.SaveChangesAsync();
    }

    public async Task Borrar(int id)
    {
        var e = await ctx.Clientes.FindAsync(id);
        if (e is not null)
        {
            ctx.Remove(e);
            await ctx.SaveChangesAsync();
        }
    }
}
