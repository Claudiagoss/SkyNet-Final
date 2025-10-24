using Microsoft.EntityFrameworkCore;
using Tickets.Api.Entidades;

namespace Tickets.Api.Repositorios;

public class RepositorioUsuario : IRepositorioUsuario
{
    private readonly AppDbContext ctx;

    public RepositorioUsuario(AppDbContext ctx)
    {
        this.ctx = ctx;
    }

    /// <summary>
    /// Crea un nuevo usuario en la base de datos y devuelve su ID.
    /// </summary>
    public async Task<int> Crear(Usuario u)
    {
        ctx.Usuarios.Add(u);
        await ctx.SaveChangesAsync();
        return u.UsuarioId;
    }

    /// <summary>
    /// Obtiene un usuario por su ID (solo lectura, sin seguimiento).
    /// </summary>
    public Task<Usuario?> ObtenerPorId(int id)
    {
        return ctx.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UsuarioId == id);
    }

    /// <summary>
    /// Obtiene un usuario por su username (para login o validaciones).
    /// </summary>
    public Task<Usuario?> ObtenerPorUsername(string username)
    {
        return ctx.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Username == username);
    }

    /// <summary>
    /// Devuelve la lista completa de usuarios ordenados por ID.
    /// </summary>
    public Task<List<Usuario>> ObtenerTodos()
    {
        return ctx.Usuarios
            .AsNoTracking()
            .OrderBy(x => x.UsuarioId)
            .ToListAsync();
    }

    /// <summary>
    /// Actualiza los datos de un usuario existente.
    /// </summary>
    public async Task Actualizar(Usuario u)
    {
        ctx.Usuarios.Update(u);
        await ctx.SaveChangesAsync();
    }
    public Task<Usuario?> ObtenerPorEmail(string email) =>
    ctx.Usuarios.AsNoTracking().FirstOrDefaultAsync(x => x.Email == email);
    /// <summary>
    /// Elimina un usuario por su ID si existe.
    /// </summary>
    public async Task Eliminar(int id)
    {
        var entidad = await ctx.Usuarios.FindAsync(id);
        if (entidad is not null)
        {
            ctx.Usuarios.Remove(entidad);
            await ctx.SaveChangesAsync();
        }
    }
}
