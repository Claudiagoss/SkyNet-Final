using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioCatalogos : IRepositorioCatalogos
{
    private readonly AppDbContext ctx;
    public RepositorioCatalogos(AppDbContext ctx) => this.ctx = ctx;

    public Task<List<EstadoTicket>> ObtenerEstados() =>
        ctx.Estados.AsNoTracking().OrderBy(x => x.EstadoId).ToListAsync();

    public Task<List<PrioridadTicket>> ObtenerPrioridades() =>
        ctx.Prioridades.AsNoTracking().OrderBy(x => x.Peso).ToListAsync();
}
