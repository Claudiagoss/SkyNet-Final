using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Net.Sockets;
using Tickets.Api;
using Tickets.Api.DTOs.Tickets;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;
using Tickets.Api.Servicios;

namespace Tickets.Api.EndPoints;

public static class TicketEndpoint
{
    public static RouteGroupBuilder MapTickets(this RouteGroupBuilder group)
    {
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
    // 🔹 FUNCIÓN AUXILIAR — Enviar correo de cierre
    // ================================================================
    private static async Task<(string cliente, string correo)> EnviarCorreoDeCierreAsync(
        Ticket ticket,
        IRepositorioCliente repoCli,
        IRepositorioUsuario repoUsr,
        IEmailService emailService,
        AppDbContext db)
    {
        string nombreCliente = "Sin cliente";
        string correoDestino = "Sin correo registrado";

        try
        {
            var cliente = await repoCli.ObtenerPorId(ticket.ClienteId);
            var tecnico = ticket.AsignadoAUsuarioId.HasValue
                ? await repoUsr.ObtenerPorId(ticket.AsignadoAUsuarioId.Value)
                : null;

            if (cliente != null)
            {
                nombreCliente = cliente.Nombre ?? "Cliente sin nombre";
                correoDestino = cliente.Email?.Trim() ?? "Sin correo registrado";
            }

            var asunto = $"Reporte de visita técnica — Ticket #{ticket.TicketId}";
            var cuerpo = $@"
                <h2>Reporte de visita técnica</h2>
                <p><b>Cliente:</b> {nombreCliente}</p>
                <p><b>Técnico asignado:</b> {(tecnico != null ? $"{tecnico.Nombre} {tecnico.Apellido}" : "No asignado")}</p>
                <p><b>Inicio:</b> {ticket.HoraIngreso?.ToLocalTime():g}</p>
                <p><b>Fin:</b> {ticket.HoraSalida?.ToLocalTime():g}</p>
                <p><b>Ubicación Inicio:</b> <a href='https://maps.google.com/?q={ticket.LatitudIngreso},{ticket.LongitudIngreso}'>Ver</a></p>
                <p><b>Ubicación Cierre:</b> <a href='https://maps.google.com/?q={ticket.LatitudSalida},{ticket.LongitudSalida}'>Ver</a></p>
                <hr><p><b>Reporte final:</b> {ticket.ReporteFinal ?? "Sin reporte final"}</p>
                <p>— Sistema SkyNet S.A.</p>";

            var reporte = new ReporteVisita
            {
                TicketId = ticket.TicketId,
                ClienteEmail = correoDestino,
                TecnicoNombre = tecnico != null ? $"{tecnico.Nombre} {tecnico.Apellido}" : "No asignado",
                Asunto = asunto,
                Contenido = cuerpo,
                Enviado = false
            };

            db.ReportesVisita.Add(reporte);
            await db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(cliente?.Email))
            {
                bool enviado = await emailService.EnviarCorreoAsync(cliente.Email, asunto, cuerpo);
                if (enviado)
                {
                    reporte.Enviado = true;
                    await db.SaveChangesAsync();
                    Console.WriteLine($"✅ Correo enviado a {cliente.Email} para Ticket #{ticket.TicketId}");
                }
                else
                {
                    Console.WriteLine($"⚠️ No se pudo enviar correo a {cliente.Email} para Ticket #{ticket.TicketId}");
                }
            }
            else
            {
                Console.WriteLine($"⚠️ Cliente sin correo. No se envió correo para Ticket #{ticket.TicketId}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en EnviarCorreoDeCierreAsync: {ex.Message}");
        }

        return (nombreCliente, correoDestino);
    }

    // ================================================================
    // 🔹 CREAR TICKET (versión estable y segura)
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
            entidad.EstadoId = entidad.EstadoId == 0 ? 1 : entidad.EstadoId; // 🔹 por defecto: Abierto

            // 🔹 Asignar técnico si no viene uno
            if (entidad.AsignadoAUsuarioId == null)
            {
                var usuarioId = await asignacionService.ResolverUsuarioParaClienteAsync(entidad.ClienteId);
                entidad.AsignadoAUsuarioId = usuarioId;
            }

            // 🔹 Guardar en DB
            var id = await repo.Crear(entidad);

            // 🔹 Devolver DTO de salida
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
        IRepositorioUsuario repoUsr,
        IRepositorioCatalogos repoCat,
        IMapper mapper)
    {
        var lista = await repo.ObtenerTodos();
        var dtos = mapper.Map<List<GetAllTicketsDTO>>(lista);

        var clientes = (await repoCli.ObtenerTodos()).ToDictionary(x => x.ClienteId, x => x.Nombre ?? "—");
        var usuarios = (await repoUsr.ObtenerTodos()).ToDictionary(x => x.UsuarioId, x => $"{x.Nombre ?? ""} {x.Apellido ?? ""}".Trim());
        var estados = (await repoCat.ObtenerEstados()).ToDictionary(x => x.EstadoId, x => x.Nombre);
        var prios = (await repoCat.ObtenerPrioridades()).ToDictionary(x => x.PrioridadId, x => x.Nombre);

        foreach (var t in dtos)
        {
            if (clientes.TryGetValue(t.ClienteId, out var cn)) t.ClienteNombre = cn;
            if (usuarios.TryGetValue(t.ReportadoPorUsuarioId, out var rn)) t.ReportadoPor = rn;
            if (t.AsignadoAUsuarioId.HasValue && usuarios.TryGetValue(t.AsignadoAUsuarioId.Value, out var an)) t.AsignadoA = an;
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
        IRepositorioUsuario repoUsr,
        IRepositorioCatalogos repoCat,
        IMapper mapper)
    {
        var entidad = await repo.ObtenerPorId(id);
        if (entidad is null) return TypedResults.NotFound();

        var dto = mapper.Map<GetAllTicketsDTO>(entidad);
        var cliente = await repoCli.ObtenerPorId(entidad.ClienteId);
        var reporta = await repoUsr.ObtenerPorId(entidad.ReportadoPorUsuarioId);
        var asignado = entidad.AsignadoAUsuarioId.HasValue
            ? await repoUsr.ObtenerPorId(entidad.AsignadoAUsuarioId.Value)
            : null;
        var estado = (await repoCat.ObtenerEstados()).FirstOrDefault(x => x.EstadoId == entidad.EstadoId);
        var prio = (await repoCat.ObtenerPrioridades()).FirstOrDefault(x => x.PrioridadId == entidad.PrioridadId);

        dto.ClienteNombre = cliente?.Nombre;
        dto.ReportadoPor = reporta is null ? null : $"{reporta.Nombre} {reporta.Apellido}";
        dto.AsignadoA = asignado is null ? null : $"{asignado.Nombre} {asignado.Apellido}";
        dto.Estado = estado?.Nombre;
        dto.Prioridad = prio?.Nombre;

        return TypedResults.Ok(dto);
    }

    // ================================================================
    // 🔹 ACTUALIZAR
    // ================================================================
    static async Task<Results<NoContent, NotFound>> ActualizarTicket(
        int id,
        ActualizarTicketDTO dto,
        IRepositorioTicket repo)
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
        if (dto.CerradoEl.HasValue) actual.CerradoEl = dto.CerradoEl;
        if (dto.EstadoId.HasValue) actual.EstadoId = dto.EstadoId.Value;

        actual.ActualizadoEl = DateTime.UtcNow;
        await repo.Actualizar(actual);

        return TypedResults.NoContent();
    }

    // ================================================================
    // 🔹 BORRAR
    // ================================================================
    static async Task<Results<NoContent, NotFound>> BorrarTicket(int id, IRepositorioTicket repo)
    {
        var existe = await repo.ObtenerPorId(id);
        if (existe is null) return TypedResults.NotFound();

        await repo.Borrar(id);
        return TypedResults.NoContent();
    }

    // ================================================================
    // 🔹 CERRAR TICKET
    // ================================================================
    static async Task<IResult> CerrarTicket(
    int id,
    IRepositorioTicket repo,
    IRepositorioCliente repoCli,
    IRepositorioUsuario repoUsr,
    IEmailService emailService,
    AppDbContext db)
{
    var ticket = await repo.ObtenerPorId(id);
    if (ticket is null) return TypedResults.NotFound();

    ticket.EstadoId = 3;
    ticket.HoraSalida = DateTime.UtcNow;
    ticket.CerradoEl = DateTime.UtcNow;
    ticket.ActualizadoEl = DateTime.UtcNow;

    await repo.Actualizar(ticket);

    var (clienteNombre, correoCliente) = await EnviarCorreoDeCierreAsync(ticket, repoCli, repoUsr, emailService, db);

    return TypedResults.Ok(new
    {
        mensaje = $"✅ Ticket {id} cerrado correctamente.",
        cliente = clienteNombre,
        correo = correoCliente
    });
}
    // ================================================================
    // 🔹 CHECK-IN
    // ================================================================
    static async Task<Results<Ok<string>, NotFound>> CheckInVisita(int id, VisitaCheckInDTO dto, IRepositorioTicket repo)
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

    // ================================================================
    // 🔹 CHECK-OUT (versión limpia para móvil/técnico)
    // ================================================================
    static async Task<Results<Ok<object>, NotFound, ProblemHttpResult>> CheckOutVisita(
        int id,
        VisitaCheckOutDTO dto,
        IRepositorioTicket repo,
        IRepositorioCliente repoCli,
        IRepositorioUsuario repoUsr,
        IEmailService emailService,
        AppDbContext db)
    {
        try
        {
            var ticket = await repo.ObtenerPorId(id);
            if (ticket is null)
                return TypedResults.NotFound();

            // 🔹 Actualizar ticket
            ticket.HoraSalida = DateTime.UtcNow;
            ticket.LatitudSalida = dto.LatitudSalida;
            ticket.LongitudSalida = dto.LongitudSalida;
            ticket.ReporteFinal = dto.ReporteFinal ?? "Sin reporte final";
            ticket.EstadoId = 3;
            ticket.CerradoEl = DateTime.UtcNow;
            ticket.ActualizadoEl = DateTime.UtcNow;

            await repo.Actualizar(ticket);

            // 🔹 Enviar correo de cierre
            await EnviarCorreoDeCierreAsync(ticket, repoCli, repoUsr, emailService, db);

            // 🔹 Mensaje limpio para el frontend
            return TypedResults.Ok<object>(new
            {
                mensaje = "✅ Ticket cerrado correctamente",
                correo = "📧 Correo enviado correctamente"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en CheckOutVisita: {ex.Message}");
            return TypedResults.Problem($"Error al cerrar la visita: {ex.Message}");
        }
    }

    // ================================================================
// 🔹 VISITAS ACTIVAS — (Abierto o En Progreso)
// ================================================================
static async Task<IResult> VisitasActivas(
    HttpContext context,
    IRepositorioTicket repo,
    IRepositorioCliente repoCli,
    IRepositorioUsuario repoUsr)
{
    var usuarioId = JwtHelper.ObtenerUsuarioId(context);
    var rolId = JwtHelper.ObtenerRolId(context);

    var tickets = (await repo.ObtenerTodos())
        .Where(t => t.EstadoId == 1 || t.EstadoId == 2)
        .ToList();

    if (rolId == 5)
        tickets = tickets.Where(t => t.AsignadoAUsuarioId == usuarioId).ToList();

    var clientes = (await repoCli.ObtenerTodos())
        .ToDictionary(x => x.ClienteId, x => x.Nombre ?? "Desconocido");

    var usuarios = (await repoUsr.ObtenerTodos())
        .ToDictionary(x => x.UsuarioId, x => $"{x.Nombre ?? ""} {x.Apellido ?? ""}".Trim());

    var result = tickets.Select(t => new VisitaActivaDTO
    {
        TicketId = t.TicketId,
        Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
        Tecnico = usuarios.GetValueOrDefault(t.AsignadoAUsuarioId ?? 0, "Sin asignar"),
        Estado = t.EstadoId == 1 ? "Abierto" : "En Progreso",
        Titulo = t.Titulo,
        HoraIngreso = t.HoraIngreso,
        LatitudIngreso = t.LatitudIngreso,
        LongitudIngreso = t.LongitudIngreso
    }).ToList();

    return TypedResults.Ok(result);
}

    // ================================================================
    // 🔹 VISITAS HOY
    // ================================================================
    static async Task<Ok<List<VisitaHoyDTO>>> VisitasHoy(HttpContext context, IRepositorioTicket repo, IRepositorioCliente repoCli, IRepositorioUsuario repoUsr)
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

        var clientes = (await repoCli.ObtenerTodos()).ToDictionary(x => x.ClienteId, x => x.Nombre);
        var usuarios = (await repoUsr.ObtenerTodos()).ToDictionary(x => x.UsuarioId, x => $"{x.Nombre} {x.Apellido}");

        var result = tickets.Select(t => new VisitaHoyDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault(usuarioId, "Sin asignar"),
            Titulo = t.Titulo ?? "—",
            FechaLimite = t.LimiteEl,
            Estado = t.EstadoId == 1 ? "Pendiente" : "En Progreso"
        }).ToList();

        return TypedResults.Ok(result);
    }

    // ================================================================
    // 🔹 VISITAS COMPLETADAS
    // ================================================================
    static async Task<Ok<List<VisitaCompletadaDTO>>> VisitasCompletadas(HttpContext context, IRepositorioTicket repo, IRepositorioCliente repoCli, IRepositorioUsuario repoUsr)
    {
        var usuarioId = JwtHelper.ObtenerUsuarioId(context);
        var rolId = JwtHelper.ObtenerRolId(context);

        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.HoraSalida != null)
            .OrderByDescending(t => t.HoraSalida)
            .ToList();

        if (rolId == 5)
            tickets = tickets.Where(t => t.AsignadoAUsuarioId == usuarioId).ToList();

        var clientes = (await repoCli.ObtenerTodos()).ToDictionary(x => x.ClienteId, x => x.Nombre);
        var usuarios = (await repoUsr.ObtenerTodos()).ToDictionary(x => x.UsuarioId, x => $"{x.Nombre} {x.Apellido}");

        var result = tickets.Select(t => new VisitaCompletadaDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault(usuarioId, "Sin asignar"),
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
    static async Task<Ok<List<VisitaHoyDTO>>> VisitasPorTecnico(int id, IRepositorioTicket repo, IRepositorioCliente repoCli, IRepositorioUsuario repoUsr)
    {
        var tickets = (await repo.ObtenerTodos())
            .Where(t => t.AsignadoAUsuarioId == id && (t.EstadoId == 1 || t.EstadoId == 2))
            .ToList();

        var clientes = (await repoCli.ObtenerTodos()).ToDictionary(x => x.ClienteId, x => x.Nombre);
        var usuarios = (await repoUsr.ObtenerTodos()).ToDictionary(x => x.UsuarioId, x => $"{x.Nombre} {x.Apellido}");

        var result = tickets.Select(t => new VisitaHoyDTO
        {
            TicketId = t.TicketId,
            Cliente = clientes.GetValueOrDefault(t.ClienteId, "Desconocido"),
            Tecnico = usuarios.GetValueOrDefault(id, "Sin asignar"),
            Titulo = t.Titulo ?? "—",
            FechaLimite = t.LimiteEl,
            Estado = t.EstadoId == 1 ? "Pendiente" : "En proceso",
            GoogleMapsUrl = (t.LatitudIngreso != null && t.LongitudIngreso != null)
                ? $"https://maps.google.com/?q={t.LatitudIngreso},{t.LongitudIngreso}"
                : null
        }).ToList();

        return TypedResults.Ok(result);
    }
}
