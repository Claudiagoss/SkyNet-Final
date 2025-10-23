using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioCliente
{
    Task<int> Crear(Cliente c);
    Task<List<Cliente>> ObtenerTodos();
    Task<Cliente?> ObtenerPorId(int id);
    Task Actualizar(Cliente c);
    Task Borrar(int id);
}
