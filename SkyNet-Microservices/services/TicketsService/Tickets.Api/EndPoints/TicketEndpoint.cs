using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authorization;
using Tickets.Api.DTOs.Tickets;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;
using Tickets.Api.Servicios;

namespace Tickets.Api.EndPoints;

public static class TicketEndpoint
{
    public static RouteGroupBuilder MapTickets(this RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapPost("/tickets", CrearTicket);
        group.MapGet("/tickets", ObtenerTodos);
        group.MapGet("/tickets/{id:int}", ObtenerPorId);
        group.MapPut("/tickets/{id:int}", ActualizarTicket);
        group.MapDelete("/tickets/{id:int}", BorrarTicket);
        group.MapPut("/tickets/{id:int}/cerrar", CerrarTicket);
        group.MapPost("/tickets/{id:int}/checkin", CheckInVisita);
        group.MapPost("/tickets/{id:int}/checkout", CheckOutVisita);
        group.MapGet("/tickets/visitas/activas", VisitasActivas);
        group.MapGet("/tickets/visitas/hoy", VisitasHoy);
        group.MapGet("/tickets/visitas/completadas", VisitasCompletadas);
        group.MapGet("/tickets/visitas/tecnico/{id:int}", VisitasPorTecnico);

        return group;
    }

    // ================================================================
    // 🔹 CREAR TICKET
    // ================================================================
    static async Task<Results<Created<GetAllTicketsDTO>, ValidationProblem>> CrearTicket(
        CrearTicketDTO dto,
        IRepositorioTicket repo,
        IAsignacionService asignacionService,
        IMapper mapper)
    {
        try
        {
            var entidad = mapper.Map<Ticket>(dto);
            entidad.LimiteEl = dto.LimiteEl ?? DateTime.UtcNow;
            entidad.CreadoEl = DateTime.UtcNow;
            entidad.ActualizadoEl = DateTime.UtcNow;
            entidad.EstadoId = entidad.EstadoId == 0 ? 1 : entidad.EstadoId;

            if (entidad.AsignadoAUsuarioId == null)
            {
                var usuarioId = await asignacionService.ResolverUsuarioParaClienteAsync(entidad.ClienteId);
                entidad.AsignadoAUsuarioId = usuarioId;
            }

            var id = await repo.Crear(entidad);
            var dtoOut = mapper.Map<GetAllTicketsDTO>(entidad);

            return TypedResults.Created($"/tickets/{id}", dtoOut);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"🔥 Error creando ticket: {ex.Message}");
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> 
            { 
                { "Error", new[] { ex.Message } } 
            });
        }
    }

    // ================================================================
    // 🔹 OBTENER TODOS
    // ================================================================
    static async Task<Ok<List<GetAllTicketsDTO>>> ObtenerTodos(
        IRepositorioTicket repo,
        IRepositorioCliente repoCli,
        IRepositorioCatalogos repoCat,
        IAuthClientService authClient,
        IMapper mapper)
    {
        var lista = await repo.ObtenerTodos();
        var dtos = mapper.Map<List<GetAllTicketsDTO>>(lista);

        var clientes = (await repoCli.ObtenerTodos())
            .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "—");
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();
        var estados = (await repoCat.ObtenerEstados())
            .ToDictionary(x => x.EstadoId, x => x.Nombre);
        var prios = (await repoCat.ObtenerPrioridades())
            .ToDictionary(x => x.PrioridadId, x => x.Nombre);

        foreach (var t in dtos)
        {
            if (clientes.TryGetValue(t.ClienteId, out var cn)) t.ClienteNombre = cn;
            if (t.ReportadoPorUsuarioId != 0 && usuarios.TryGetValue(t.ReportadoPorUsuarioId, out var rn))
                t.ReportadoPor = rn;
            if ((t.AsignadoAUsuarioId ?? 0) != 0 && usuarios.TryGetValue(t.AsignadoAUsuarioId ?? 0, out var an))
                t.AsignadoA = an;
            if (estados.TryGetValue(t.EstadoId, out var en)) t.Estado = en;
            if (prios.TryGetValue(t.PrioridadId, out var pn)) t.Prioridad = pn;
        }

        return TypedResults.Ok(dtos);
    }

    // ================================================================
    // 🔹 OBTENER POR ID
    // ================================================================
    static async Task<Results<Ok<GetAllTicketsDTO>, NotFound>> ObtenerPorId(
        int id,
        IRepositorioTicket repo,
        IRepositorioCliente repoCli,
        IRepositorioCatalogos repoCat,
        IAuthClientService authClient,
        IMapper mapper)
    {
        var entidad = await repo.ObtenerPorId(id);
        if (entidad is null) return TypedResults.NotFound();

        var dto = mapper.Map<GetAllTicketsDTO>(entidad);
        var cliente = await repoCli.ObtenerPorId(entidad.ClienteId);
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();

        dto.ClienteNombre = cliente?.Nombre;

        if (entidad.ReportadoPorUsuarioId != 0 && usuarios.TryGetValue(entidad.ReportadoPorUsuarioId, out var rn))
            dto.ReportadoPor = rn;

        if ((entidad.AsignadoAUsuarioId ?? 0) != 0 && usuarios.TryGetValue(entidad.AsignadoAUsuarioId ?? 0, out var an))
            dto.AsignadoA = an;

        var estado = (await repoCat.ObtenerEstados())
            .FirstOrDefault(x => x.EstadoId == entidad.EstadoId);
        var prio = (await repoCat.ObtenerPrioridades())
            .FirstOrDefault(x => x.PrioridadId == entidad.PrioridadId);

        dto.Estado = estado?.Nombre;
        dto.Prioridad = prio?.Nombre;

        return TypedResults.Ok(dto);
    }

    // ================================================================
    // 🔹 ACTUALIZAR / BORRAR
    // ================================================================
    static async Task<Results<NoContent, NotFound>> ActualizarTicket(
        int id, ActualizarTicketDTO dto, IRepositorioTicket repo)
    {
        var actual = await repo.ObtenerPorId(id);
        if (actual is null) return TypedResults.NotFound();

        if (dto.Titulo is not null) actual.Titulo = dto.Titulo;
        if (dto.Descripcion is not null) actual.Descripcion = dto.Descripcion;
        if (dto.ClienteId.HasValue) actual.ClienteId = dto.ClienteId.Value;
        if (dto.ReportadoPorUsuarioId.HasValue) actual.ReportadoPorUsuarioId = dto.ReportadoPorUsuarioId.Value;
        if (dto.AsignadoAUsuarioId.HasValue) actual.AsignadoAUsuarioId = dto.AsignadoAUsuarioId;
        if (dto.PrioridadId.HasValue) actual.PrioridadId = dto.PrioridadId.Value;
        if (dto.LimiteEl.HasValue) actual.LimiteEl = dto.LimiteEl;
        if (dto.EstadoId.HasValue) actual.EstadoId = dto.EstadoId.Value;

        actual.ActualizadoEl = DateTime.UtcNow;
        await repo.Actualizar(actual);
        return TypedResults.NoContent();
    }

    static async Task<Results<NoContent, NotFound>> BorrarTicket(int id, IRepositorioTicket repo)
    {
        var existe = await repo.ObtenerPorId(id);
        if (existe is null) return TypedResults.NotFound();

        await repo.Borrar(id);
        return TypedResults.NoContent();
    }

    // ================================================================
    // 🔹 CERRAR / CHECK-IN / CHECK-OUT
    // ================================================================
    static async Task<IResult> CerrarTicket(
        int id, IRepositorioTicket repo, IRepositorioCliente repoCli,
        IEmailService emailService, AppDbContext db, IAuthClientService authClient)
    {
        var ticket = await repo.ObtenerPorId(id);
        if (ticket is null) return TypedResults.NotFound();

        ticket.EstadoId = 3;
        ticket.HoraSalida = DateTime.UtcNow;
        ticket.CerradoEl = DateTime.UtcNow;
        ticket.ActualizadoEl = DateTime.UtcNow;
        await repo.Actualizar(ticket);

        await emailService.NotificarCierreAsync(ticket, repoCli, authClient, db);
        return TypedResults.Ok(new { mensaje = $"✅ Ticket {id} cerrado correctamente." });
    }

    static async Task<Results<Ok<string>, NotFound>> CheckInVisita(
        int id, VisitaCheckInDTO dto, IRepositorioTicket repo)
    {
        var ticket = await repo.ObtenerPorId(id);
        if (ticket is null) return TypedResults.NotFound();

        ticket.HoraIngreso = DateTime.UtcNow;
        ticket.LatitudIngreso = dto.LatitudIngreso;
        ticket.LongitudIngreso = dto.LongitudIngreso;
        ticket.EstadoId = 2;
        ticket.ActualizadoEl = DateTime.UtcNow;
        await repo.Actualizar(ticket);

        return TypedResults.Ok($"✅ Check-In registrado en Ticket {id}");
    }

    static async Task<Results<Ok<object>, NotFound, ProblemHttpResult>> CheckOutVisita(
        int id, VisitaCheckOutDTO dto,
        IRepositorioTicket repo, IRepositorioCliente repoCli,
        IEmailService emailService, IAuthClientService authClient, AppDbContext db)
    {
        try
        {
            var ticket = await repo.ObtenerPorId(id);
            if (ticket is null) return TypedResults.NotFound();

            ticket.HoraSalida = DateTime.UtcNow;
            ticket.LatitudSalida = dto.LatitudSalida;
            ticket.LongitudSalida = dto.LongitudSalida;
            ticket.ReporteFinal = dto.ReporteFinal ?? "Sin reporte final";
            ticket.EstadoId = 3;
            ticket.CerradoEl = DateTime.UtcNow;
            ticket.ActualizadoEl = DateTime.UtcNow;
            await repo.Actualizar(ticket);

            await emailService.NotificarCierreAsync(ticket, repoCli, authClient, db);

            return TypedResults.Ok<object>(new { mensaje = "✅ Ticket cerrado correctamente" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en CheckOutVisita: {ex.Message}");
            return TypedResults.Problem($"Error al cerrar la visita: {ex.Message}");
        }
    }

    // ================================================================
    // 🔹 VISITAS HOY
    // ================================================================
    static async Task<Ok<List<VisitaHoyDTO>>> VisitasHoy(
        HttpContext context, IRepositorioTicket repo,
        IRepositorioCliente repoCli, IAuthClientService authClient)
    {
        var usuarioId = JwtHelper.ObtenerUsuarioId(context);
        var rolId = JwtHelper.ObtenerRolId(context);

        var hoy = DateTime.Today;
        var mañana = hoy.AddDays(1);

        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.LimiteEl.HasValue && t.LimiteEl.Value >= hoy && t.LimiteEl.Value < mañana)
            .ToList();

        if (rolId == 5)
            tickets = tickets.Where(t => t.AsignadoAUsuarioId == usuarioId).ToList();

        var clientes = (await repoCli.ObtenerTodos())
            .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "—");
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();

        var result = tickets.Select(t => new VisitaHoyDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault<int, string>(t.AsignadoAUsuarioId ?? 0, "Sin asignar"),
            Titulo = t.Titulo ?? "—",
            FechaLimite = t.LimiteEl,
            Estado = t.EstadoId == 1 ? "Pendiente" : "En Progreso"
        }).ToList();

        return TypedResults.Ok(result);
    }

    // ================================================================
    // 🔹 VISITAS COMPLETADAS
    // ================================================================
    static async Task<Ok<List<VisitaCompletadaDTO>>> VisitasCompletadas(
        HttpContext context, IRepositorioTicket repo,
        IRepositorioCliente repoCli, IAuthClientService authClient)
    {
        var usuarioId = JwtHelper.ObtenerUsuarioId(context);
        var rolId = JwtHelper.ObtenerRolId(context);

        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.HoraSalida != null)
            .OrderByDescending(t => t.HoraSalida)
            .ToList();

        if (rolId == 5)
            tickets = tickets.Where(t => t.AsignadoAUsuarioId == usuarioId).ToList();

        var clientes = (await repoCli.ObtenerTodos())
            .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "Desconocido");
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();

        var result = tickets.Select(t => new VisitaCompletadaDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault<int, string>(t.AsignadoAUsuarioId ?? 0, "Sin asignar"),
            FechaLimite = t.LimiteEl,
            HoraIngreso = t.HoraIngreso,
            HoraSalida = t.HoraSalida,
            ReporteFinal = t.ReporteFinal
        }).ToList();

        return TypedResults.Ok(result);
    }

    // ================================================================
    // 🔹 VISITAS POR TÉCNICO
    // ================================================================
    static async Task<Ok<List<VisitaHoyDTO>>> VisitasPorTecnico(
        int id, IRepositorioTicket repo,
        IRepositorioCliente repoCli, IAuthClientService authClient)
    {
        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.AsignadoAUsuarioId == id && (t.EstadoId == 1 || t.EstadoId == 2))
            .ToList();

        var clientes = (await repoCli.ObtenerTodos())
            .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "Desconocido");
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();

        var result = tickets.Select(t => new VisitaHoyDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault<int, string>(id, "Sin asignar"),
            Titulo = t.Titulo ?? "—",
            FechaLimite = t.LimiteEl,
            Estado = t.EstadoId == 1 ? "Pendiente" : "En proceso",
            GoogleMapsUrl = (t.LatitudIngreso != null && t.LongitudIngreso != null)
                ? $"https://maps.google.com/?q={t.LatitudIngreso},{t.LongitudIngreso}"
                : null
        }).ToList();

        return TypedResults.Ok(result);
    }

    // ================================================================
    // 🔹 VISITAS ACTIVAS
    // ================================================================
    static async Task<IResult> VisitasActivas(
        HttpContext context, IRepositorioTicket repo,
        IRepositorioCliente repoCli, IAuthClientService authClient)
    {
        var usuarioId = JwtHelper.ObtenerUsuarioId(context);
        var rolId = JwtHelper.ObtenerRolId(context);

        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.EstadoId is 1 or 2)
            .ToList();

        if (rolId == 5)
            tickets = tickets.Where(t => t.AsignadoAUsuarioId == usuarioId).ToList();

        var clientes = (await repoCli.ObtenerTodos())
            .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "Desconocido");
        var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();

        var result = tickets.Select(t => new VisitaActivaDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault<int, string>(t.AsignadoAUsuarioId ?? 0, "Sin asignar"),
            Estado = t.EstadoId == 1 ? "Abierto" : "En Progreso",
            Titulo = t.Titulo,
            HoraIngreso = t.HoraIngreso,
            LatitudIngreso = t.LatitudIngreso,
            LongitudIngreso = t.LongitudIngreso
        }).ToList();

        return TypedResults.Ok(result);
    }
}
