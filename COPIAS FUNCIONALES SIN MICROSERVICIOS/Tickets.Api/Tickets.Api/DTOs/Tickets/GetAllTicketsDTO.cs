namespace Tickets.Api.DTOs.Tickets;

public class GetAllTicketsDTO
{
    public int TicketId { get; set; }
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;

    public int ClienteId { get; set; }
    public string? ClienteNombre { get; set; }

    public int ReportadoPorUsuarioId { get; set; }
    public string? ReportadoPor { get; set; }

    public int? AsignadoAUsuarioId { get; set; }
    public string? AsignadoA { get; set; }

    public int EstadoId { get; set; }
    public string? Estado { get; set; }

    public int PrioridadId { get; set; }
    public string? Prioridad { get; set; }

    public DateTime CreadoEl { get; set; }
    public DateTime? LimiteEl { get; set; }
    public DateTime? CerradoEl { get; set; }
    public double? LatitudIngreso { get; set; }
    public double? LongitudIngreso { get; set; }
    public double? LatitudSalida { get; set; }
    public double? LongitudSalida { get; set; }
}
