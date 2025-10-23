using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioComentario : IRepositorioComentario
{
    private readonly AppDbContext ctx;
    public RepositorioComentario(AppDbContext ctx) => this.ctx = ctx;

    public async Task<int> Crear(Comentario c)
    {
        ctx.Comentarios.Add(c);
        await ctx.SaveChangesAsync();
        return c.ComentarioId;
    }

    public Task<List<Comentario>> ObtenerPorTicket(int ticketId) =>
        ctx.Comentarios.AsNoTracking()
           .Where(x => x.TicketId == ticketId)
           .OrderBy(x => x.CreadoEl)
           .ToListAsync();
}
