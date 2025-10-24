using Microsoft.AspNetCore.Http.HttpResults;
using Tickets.Api.DTOs.Usuarios;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;

namespace Tickets.Api.EndPoints;

public static class UsuarioEndpoint
{
    public static RouteGroupBuilder MapUsuarios(this RouteGroupBuilder group)
    {
        group.MapPost("/usuarios", CrearUsuario);
        group.MapGet("/usuarios", ObtenerTodos);
        group.MapPut("/usuarios/{id:int}", ActualizarUsuario);
        group.MapDelete("/usuarios/{id:int}", EliminarUsuario);
        return group;
    }

    // ✅ CREAR USUARIO — ahora devuelve todos los duplicados juntos
    // ✅ CREAR USUARIO — ahora devuelve todos los duplicados juntos
    static async Task<IResult> CrearUsuario(CrearUsuarioDTO dto, IRepositorioUsuario repo)
    {
        // 🔸 1. Verificar duplicado de Username primero
        var duplicadoUsername = await repo.ObtenerPorUsername(dto.Username);
        if (duplicadoUsername is not null)
            return TypedResults.Conflict(new
            {
                field = "username",
                code = "duplicate",
                message = $"El usuario \"{dto.Username}\" ya existe."
            });

        // 🔸 2. Verificar duplicado de Email después (no simultáneo)
        var duplicadoEmail = await repo.ObtenerPorEmail(dto.Email);
        if (duplicadoEmail is not null)
            return TypedResults.Conflict(new
            {
                field = "email",
                code = "duplicate",
                message = $"El correo \"{dto.Email}\" ya está registrado."
            });

        // ✅ Crear nuevo usuario
        var u = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            Telefono = dto.Telefono,
            Username = dto.Username,
            PasswordHash = dto.PasswordHash,
            RolId = dto.RolId,
            EsActivo = true,
            CreadoEl = DateTime.UtcNow
        };

        var id = await repo.Crear(u);

        return TypedResults.Created($"/usuarios/{id}", new
        {
            usuarioId = id,
            message = "Usuario creado correctamente"
        });
    }

    // ✅ OBTENER TODOS LOS USUARIOS
    static async Task<Ok<List<GetAllUsuariosDTO>>> ObtenerTodos(IRepositorioUsuario repo)
    {
        var lista = await repo.ObtenerTodos();
        var dto = lista.Select(u => new GetAllUsuariosDTO
        {
            UsuarioId = u.UsuarioId,
            Nombre = u.Nombre,
            Apellido = u.Apellido,
            Email = u.Email,
            Telefono = u.Telefono,
            Username = u.Username,
            RolId = u.RolId,
            EsActivo = u.EsActivo
        }).ToList();

        return TypedResults.Ok(dto);
    }

    // ✅ ACTUALIZAR USUARIO — devuelve múltiples errores si hay duplicados
    static async Task<IResult> ActualizarUsuario(int id, ActualizarUsuarioDTO dto, IRepositorioUsuario repo)
    {
        var existente = await repo.ObtenerPorId(id);
        if (existente is null)
            return TypedResults.NotFound(new { message = "Usuario no encontrado." });

        // Consultas en paralelo
        var tUser = repo.ObtenerPorUsername(dto.Username);
        var tMail = repo.ObtenerPorEmail(dto.Email);
        await Task.WhenAll(tUser, tMail);

        var errores = new List<object>();

        if (tUser.Result is not null && tUser.Result.UsuarioId != id)
            errores.Add(new
            {
                field = "username",
                code = "duplicate",
                message = $"El usuario \"{dto.Username}\" ya está en uso."
            });

        if (tMail.Result is not null && tMail.Result.UsuarioId != id)
            errores.Add(new
            {
                field = "email",
                code = "duplicate",
                message = $"El correo \"{dto.Email}\" ya está registrado."
            });

        if (errores.Count > 0)
            return TypedResults.Conflict(new { errors = errores });

        // ✅ Actualizar datos básicos
        existente.Nombre = dto.Nombre;
        existente.Apellido = dto.Apellido;
        existente.Email = dto.Email;
        existente.Telefono = dto.Telefono;
        existente.Username = dto.Username;
        existente.RolId = dto.RolId;
        existente.EsActivo = dto.EsActivo;
        existente.ActualizadoEl = DateTime.UtcNow;

        // ✅ Solo cambiar contraseña si se envía una nueva
        if (!string.IsNullOrWhiteSpace(dto.PasswordHash))
        {
            existente.PasswordHash = dto.PasswordHash;
        }

        await repo.Actualizar(existente);
        return TypedResults.Ok(new { message = "Usuario actualizado correctamente" });
    }

    // ✅ ELIMINAR USUARIO — respuesta elegante
    static async Task<IResult> EliminarUsuario(int id, IRepositorioUsuario repo)
    {
        var existe = await repo.ObtenerPorId(id);
        if (existe is null)
            return TypedResults.NotFound(new { message = "Usuario no existe o ya fue eliminado." });

        await repo.Eliminar(id);
        return TypedResults.Ok(new { message = "Usuario eliminado correctamente" });
    }
}
