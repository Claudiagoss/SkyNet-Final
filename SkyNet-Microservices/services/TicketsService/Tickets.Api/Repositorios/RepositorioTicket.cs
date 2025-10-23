using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioTicket : IRepositorioTicket
{
    private readonly AppDbContext ctx;
    public RepositorioTicket(AppDbContext ctx) => this.ctx = ctx;

    public async Task<int> Crear(Ticket t)
    {
        ctx.Tickets.Add(t);
        await ctx.SaveChangesAsync();
        return t.TicketId;
    }

    public Task<List<Ticket>> ObtenerTodos() =>
        ctx.Tickets.AsNoTracking().OrderByDescending(x => x.TicketId).ToListAsync();

    public Task<Ticket?> ObtenerPorId(int id) =>
        ctx.Tickets.AsNoTracking().FirstOrDefaultAsync(x => x.TicketId == id);

    public async Task Actualizar(Ticket t)
    {
        ctx.Tickets.Update(t);
        await ctx.SaveChangesAsync();
    }

    public async Task Borrar(int id)
    {
        var e = await ctx.Tickets.FindAsync(id);
        if (e is not null)
        {
            ctx.Tickets.Remove(e);
            await ctx.SaveChangesAsync();
        }
    }
}
