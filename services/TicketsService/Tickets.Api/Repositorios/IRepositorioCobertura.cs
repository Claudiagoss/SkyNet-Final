using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioCobertura
{
    Task<int> CrearCoberturaAsync(int usuarioId, string departamento, int prioridad);
    Task<List<UsuarioCobertura>> ListarCoberturaAsync(string? departamento = null);
    Task DesactivarCoberturaAsync(int usuarioCoberturaId);
}
