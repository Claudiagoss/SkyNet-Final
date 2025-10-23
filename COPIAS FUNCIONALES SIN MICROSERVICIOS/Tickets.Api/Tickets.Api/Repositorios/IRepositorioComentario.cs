using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioComentario
{
    Task<int> Crear(Comentario c);
    Task<List<Comentario>> ObtenerPorTicket(int ticketId);
}
