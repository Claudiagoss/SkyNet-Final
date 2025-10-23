namespace Tickets.Api.DTOs.Tickets;

public class VisitaActivaDTO
{
    public int TicketId { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string Tecnico { get; set; } = string.Empty;

    // 🕓 Hora en que inició la visita
    public DateTime? HoraIngreso { get; set; }

    // 📍 Coordenadas del lugar donde se registró el ingreso
    public double? LatitudIngreso { get; set; }
    public double? LongitudIngreso { get; set; }

    // 🔗 Enlace a Google Maps (si tiene coordenadas)
    public string GoogleMapsUrl { get; set; } = string.Empty;

    // 📦 Estado actual (Pendiente, En proceso, Terminado, etc.)
    public string Estado { get; set; } = string.Empty;

    // 📅 Fecha límite del ticket (para mostrar semáforo)
    public DateTime? FechaLimite { get; set; }

    // 🟢 Estado del semáforo (color visual en frontend)
    public string EstadoColor { get; set; } = string.Empty;
    public string? Titulo { get; set; }
}
