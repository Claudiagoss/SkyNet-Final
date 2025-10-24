using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Clientes.Api.Entidades;

namespace Clientes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportesController(AppDbContext context)
    {
        _context = context;
    }

    // 🔹 GET: /api/reportes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reportes = await _context.Reportes.ToListAsync();
        return Ok(reportes);
    }

    // 🔹 POST: /api/reportes
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Reporte reporte)
    {
        reporte.GeneradoEl = DateTime.UtcNow;
        _context.Reportes.Add(reporte);
        await _context.SaveChangesAsync();
        return Ok(reporte);
    }
}
