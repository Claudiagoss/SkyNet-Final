using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Tickets.Api.DTOs.Comentarios;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;

namespace Tickets.Api.EndPoints;

public static class ComentarioEndpoint
{
    public static RouteGroupBuilder MapComentarios(this RouteGroupBuilder group)
    {
        group.MapPost("/tickets/{ticketId:int}/comentarios", CrearComentario);
        group.MapGet("/tickets/{ticketId:int}/comentarios", ObtenerPorTicket);
        return group;
    }

    static async Task<Results<Created<GetAllComentariosDTO>, ValidationProblem>> CrearComentario(
        int ticketId,
        CrearComentarioDTO dto,
        IRepositorioComentario repoCom,
        IRepositorioTicket repoTicket,
        IMapper mapper)
    {
        var t = await repoTicket.ObtenerPorId(ticketId);
        if (t is null)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["ticketId"] = new[] { "El ticket no existe" }
            });
        }

        var entidad = mapper.Map<Comentario>(dto);
        entidad.TicketId = ticketId;

        var id = await repoCom.Crear(entidad);

        var dtoOut = mapper.Map<GetAllComentariosDTO>(entidad);
        return TypedResults.Created($"/tickets/{ticketId}/comentarios/{id}", dtoOut);
    }

    static async Task<Ok<List<GetAllComentariosDTO>>> ObtenerPorTicket(
        int ticketId,
        IRepositorioComentario repoCom,
        IRepositorioUsuario repoUsr,
        IMapper mapper)
    {
        var lista = await repoCom.ObtenerPorTicket(ticketId);
        var dtos = mapper.Map<List<GetAllComentariosDTO>>(lista);
        var usuarios = (await repoUsr.ObtenerTodos()).ToDictionary(x => x.UsuarioId, x => $"{x.Nombre} {x.Apellido}");
        foreach (var c in dtos)
            if (usuarios.TryGetValue(c.UsuarioId, out var un)) c.UsuarioNombre = un;

        return TypedResults.Ok(dtos);
    }
}
