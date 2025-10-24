using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Clientes.Api.Entidades;

namespace Clientes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    // 🔹 GET: /api/clientes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clientes = await _context.Clientes
            .Include(c => c.Notificaciones)
            .ToListAsync();
        return Ok(clientes);
    }

    // 🔹 GET: /api/clientes/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Notificaciones)
            .FirstOrDefaultAsync(c => c.ClienteId == id);

        if (cliente == null) return NotFound();
        return Ok(cliente);
    }

    // 🔹 POST: /api/clientes
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Cliente cliente)
    {
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cliente.ClienteId }, cliente);
    }

    // 🔹 PUT: /api/clientes/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Cliente cliente)
    {
        var existente = await _context.Clientes.FindAsync(id);
        if (existente == null) return NotFound();

        existente.Nombre = cliente.Nombre;
        existente.Contacto = cliente.Contacto;
        existente.Email = cliente.Email;
        existente.Latitud = cliente.Latitud;
        existente.Longitud = cliente.Longitud;

        await _context.SaveChangesAsync();
        return Ok(existente);
    }

    // 🔹 DELETE: /api/clientes/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null) return NotFound();

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
