using AuthService.Entidades;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Repositorios
{
    public interface IRepositorioUsuario
    {
        Task<List<Usuario>> ObtenerTodos();
        Task<Usuario?> ObtenerPorId(int id);
        Task<Usuario> Crear(Usuario usuario);
        Task<bool> Actualizar(Usuario usuario);
        Task<bool> Borrar(int id);
    }
}