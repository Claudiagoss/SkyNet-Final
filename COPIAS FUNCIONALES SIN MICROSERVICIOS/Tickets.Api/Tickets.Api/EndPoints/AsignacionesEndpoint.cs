using Microsoft.AspNetCore.Http.HttpResults;
using Tickets.Api.Repositorios;
using Tickets.Api.Servicios;

namespace Tickets.Api.EndPoints;

public static class AsignacionesEndpoint
{
    public static RouteGroupBuilder MapAsignaciones(this RouteGroupBuilder group)
    {
        // 👇 crea un subgrupo /api/asignaciones
        var sub = group.MapGroup("/asignaciones");

        // --- Asignaciones directas y por depto ---
        sub.MapPost("/clientes", AsignarDirecto);
        sub.MapPost("/departamentos", AsignarPorDepartamento);
        sub.MapGet("/cliente/{clienteId:int}", ObtenerDuenioCliente);
        sub.MapPost("/recalcular/{clienteId:int}", RecalcularCliente);

        // --- Coberturas (todas bajo /asignaciones) ---
        sub.MapPost("/coberturas", CrearCobertura);
        sub.MapGet("/coberturas", ListarCoberturas);
        sub.MapDelete("/coberturas/{id:int}", DesactivarCobertura);

        return group;
    }

    // ========= DTOs =========
    public record AsignacionDirectaDTO(int ClienteId, int UsuarioId);
    public record AsignacionDeptoDTO(string Departamento, int UsuarioId, int Prioridad = 100);
    public record ResolverDTO(int ClienteId, int? UsuarioId, string Fuente);

    public record CoberturaDTO(
        int UsuarioCoberturaId,
        int UsuarioId,
        string Departamento,
        int Prioridad,
        bool Activo,
        DateTime CreadoEl
    );

    // ========= Handlers =========

    static async Task<Created<int>> AsignarDirecto(
        AsignacionDirectaDTO dto,
        IRepositorioAsignaciones repo)
    {
        var id = await repo.AsignarDirectoAsync(dto.ClienteId, dto.UsuarioId);
        return TypedResults.Created($"/asignaciones/clientes/{id}", id);
    }

    static async Task<Created<int>> AsignarPorDepartamento(
        AsignacionDeptoDTO dto,
        IRepositorioAsignaciones repo,
        IRepositorioCobertura cob)
    {
        var id = await repo.AsignarPorDepartamentoAsync(dto.Departamento, dto.UsuarioId);
        await cob.CrearCoberturaAsync(dto.UsuarioId, dto.Departamento, dto.Prioridad);
        return TypedResults.Created($"/asignaciones/departamentos/{id}", id);
    }

    static async Task<Ok<ResolverDTO>> ObtenerDuenioCliente(
        int clienteId,
        IAsignacionService svc)
    {
        var usuarioId = await svc.ResolverUsuarioParaClienteAsync(clienteId);
        var fuente = usuarioId.HasValue ? "Resuelto" : "Sin asignar";
        return TypedResults.Ok(new ResolverDTO(clienteId, usuarioId, fuente));
    }

    static async Task<Ok<ResolverDTO>> RecalcularCliente(
        int clienteId,
        IAsignacionService svc)
    {
        var usuarioId = await svc.ResolverUsuarioParaClienteAsync(clienteId);
        return TypedResults.Ok(new ResolverDTO(clienteId, usuarioId, usuarioId.HasValue ? "Resuelto" : "Sin asignar"));
    }

    static async Task<Created<int>> CrearCobertura(
        AsignacionDeptoDTO dto,
        IRepositorioCobertura repo)
    {
        var id = await repo.CrearCoberturaAsync(dto.UsuarioId, dto.Departamento, dto.Prioridad);
        return TypedResults.Created($"/asignaciones/coberturas/{id}", id);
    }

    static async Task<Ok<List<CoberturaDTO>>> ListarCoberturas(
        string? departamento,
        IRepositorioCobertura repo)
    {
        var lista = await repo.ListarCoberturaAsync(departamento);

        var dto = lista.Select(x => new CoberturaDTO(
            x.UsuarioCoberturaId,
            x.UsuarioId,
            x.Departamento,
            x.Prioridad,
            x.Activo,
            x.CreadoEl
        )).ToList();

        return TypedResults.Ok(dto);
    }

    static async Task<NoContent> DesactivarCobertura(
        int id,
        IRepositorioCobertura repo)
    {
        await repo.DesactivarCoberturaAsync(id);
        return TypedResults.NoContent();
    }
}
