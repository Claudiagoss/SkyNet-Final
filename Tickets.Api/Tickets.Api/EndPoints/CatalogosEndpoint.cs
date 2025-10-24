using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Tickets.Api.DTOs.Catalogos;
using Tickets.Api.Repositorios;

namespace Tickets.Api.EndPoints;

public static class CatalogosEndpoint
{
    public static RouteGroupBuilder MapCatalogos(this RouteGroupBuilder group)
    {
        group.MapGet("/catalogos/estados", ObtenerEstados);
        group.MapGet("/catalogos/prioridades", ObtenerPrioridades);
        return group;
    }

    static async Task<Ok<List<GetAllEstadosDTO>>> ObtenerEstados(
        IRepositorioCatalogos repo, IMapper mapper)
        => TypedResults.Ok(mapper.Map<List<GetAllEstadosDTO>>(await repo.ObtenerEstados()));

    static async Task<Ok<List<GetAllPrioridadesDTO>>> ObtenerPrioridades(
        IRepositorioCatalogos repo, IMapper mapper)
        => TypedResults.Ok(mapper.Map<List<GetAllPrioridadesDTO>>(await repo.ObtenerPrioridades()));
}
