using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioTicket
{
    Task<int> Crear(Ticket t);
    Task<List<Ticket>> ObtenerTodos();
    Task<Ticket?> ObtenerPorId(int id);
    Task Actualizar(Ticket t);
    Task Borrar(int id);
}
