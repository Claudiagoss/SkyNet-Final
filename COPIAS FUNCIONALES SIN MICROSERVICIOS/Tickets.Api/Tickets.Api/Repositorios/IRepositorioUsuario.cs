using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public interface IRepositorioUsuario
{
    /// <summary>
    /// Crea un nuevo usuario en la base de datos y devuelve su ID.
    /// </summary>
    Task<int> Crear(Usuario u);

    /// <summary>
    /// Obtiene un usuario por su ID.
    /// </summary>
    Task<Usuario?> ObtenerPorId(int id);

    /// <summary>
    /// Obtiene un usuario por su username (para login o validaciones).
    /// </summary>
    Task<Usuario?> ObtenerPorUsername(string username);

    /// <summary>
    /// Devuelve la lista completa de usuarios registrados.
    /// </summary>
    Task<List<Usuario>> ObtenerTodos();

    /// <summary>
    /// Actualiza los datos de un usuario existente.
    /// </summary>
    Task Actualizar(Usuario u);
    Task<Usuario?> ObtenerPorEmail(string email);

    /// <summary>
    /// Elimina un usuario por su ID.
    /// </summary>
    Task Eliminar(int id);
}
