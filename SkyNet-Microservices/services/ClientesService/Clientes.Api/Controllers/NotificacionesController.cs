using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Clientes.Api.Entidades;
using Clientes.Api.Servicios;

namespace Clientes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public NotificacionesController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 🔹 GET: /api/notificaciones
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notificaciones = await _context.Notificaciones
            .Include(n => n.Cliente)
            .ToListAsync();
        return Ok(notificaciones);
    }

    // 🔹 POST: /api/notificaciones
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notificacion notif)
    {
        var cliente = await _context.Clientes.FindAsync(notif.ClienteId);
        if (cliente == null)
            return BadRequest("El cliente no existe");

        notif.EnviadaEl = DateTime.UtcNow;
        _context.Notificaciones.Add(notif);
        await _context.SaveChangesAsync();

        // Envío del correo
        var exito = await _emailService.EnviarCorreoAsync(
            cliente.Email,
            notif.Asunto,
            $"<h3>Hola {cliente.Nombre},</h3><p>{notif.Mensaje}</p><p><b>Enviado:</b> {notif.EnviadaEl:dd/MM/yyyy HH:mm}</p>"
        );

        return Ok(new
        {
            notificacion = notif,
            correoEnviado = exito
        });
    }

    // 🔹 GET: /api/notificaciones/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var notif = await _context.Notificaciones
            .Include(n => n.Cliente)
            .FirstOrDefaultAsync(n => n.NotificacionId == id);

        if (notif == null) return NotFound();
        return Ok(notif);
    }
}
