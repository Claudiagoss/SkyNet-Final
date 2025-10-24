namespace Tickets.Api.DTOs.Tickets;

public class ActualizarTicketDTO
{
    public string? Titulo { get; set; }
    public string? Descripcion { get; set; }
    public int? ClienteId { get; set; }
    public int? ReportadoPorUsuarioId { get; set; }
    public int? AsignadoAUsuarioId { get; set; }
    public int? EstadoId { get; set; }
    public int? PrioridadId { get; set; }
    public DateTime? LimiteEl { get; set; }
    public DateTime? CerradoEl { get; set; }
}
