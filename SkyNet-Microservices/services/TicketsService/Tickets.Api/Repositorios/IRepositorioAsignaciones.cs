using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioAsignaciones
{
    Task<int> AsignarDirectoAsync(int clienteId, int usuarioId);
    Task<int> AsignarPorDepartamentoAsync(string departamento, int usuarioId);
    Task CerrarAsignacionAsync(int clienteAsignacionId);
}
