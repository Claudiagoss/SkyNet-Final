using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Tickets.Api.DTOs.Clientes;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;

namespace Tickets.Api.EndPoints;

public static class ClienteEndpoint
{
    public static RouteGroupBuilder MapClientes(this RouteGroupBuilder group)
    {
        group.MapPost("/clientes", CrearCliente);
        group.MapGet("/clientes", ObtenerTodos);
        group.MapGet("/clientes/{id:int}", ObtenerPorId);
        group.MapPut("/clientes/{id:int}", ActualizarCliente);
        group.MapDelete("/clientes/{id:int}", BorrarCliente);
        return group;
    }

    static async Task<Results<Created<GetAllClientesDTO>, ValidationProblem>> CrearCliente(
        CrearClienteDTO dto, IRepositorioCliente repo, IMapper mapper)
    {
        var entidad = mapper.Map<Cliente>(dto);
        var id = await repo.Crear(entidad);
        var dtoOut = mapper.Map<GetAllClientesDTO>(entidad);
        return TypedResults.Created($"/clientes/{id}", dtoOut);
    }

    static async Task<Ok<List<GetAllClientesDTO>>> ObtenerTodos(
        IRepositorioCliente repo, IMapper mapper)
        => TypedResults.Ok(mapper.Map<List<GetAllClientesDTO>>(await repo.ObtenerTodos()));

    static async Task<Results<Ok<GetAllClientesDTO>, NotFound>> ObtenerPorId(
        int id, IRepositorioCliente repo, IMapper mapper)
    {
        var entidad = await repo.ObtenerPorId(id);
        if (entidad is null) return TypedResults.NotFound();
        return TypedResults.Ok(mapper.Map<GetAllClientesDTO>(entidad));
    }

    static async Task<Results<NoContent, NotFound>> ActualizarCliente(
        int id, CrearClienteDTO dto, IRepositorioCliente repo, IMapper mapper)
    {
        var actual = await repo.ObtenerPorId(id);
        if (actual is null) return TypedResults.NotFound();
        mapper.Map(dto, actual);
        await repo.Actualizar(actual);
        return TypedResults.NoContent();
    }

    static async Task<Results<NoContent, NotFound>> BorrarCliente(
        int id, IRepositorioCliente repo)
    {
        var actual = await repo.ObtenerPorId(id);
        if (actual is null) return TypedResults.NotFound();
        await repo.Borrar(id);
        return TypedResults.NoContent();
    }
}
