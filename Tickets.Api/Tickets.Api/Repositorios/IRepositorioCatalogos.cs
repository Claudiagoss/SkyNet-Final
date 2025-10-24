using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioCatalogos
{
    Task<List<EstadoTicket>> ObtenerEstados();
    Task<List<PrioridadTicket>> ObtenerPrioridades();
}
