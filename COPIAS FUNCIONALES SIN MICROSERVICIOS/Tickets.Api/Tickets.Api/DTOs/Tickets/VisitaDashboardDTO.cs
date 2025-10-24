namespace Tickets.Api.DTOs.Tickets
{
    public class VisitaDashboardDTO
    {
        public int TicketId { get; set; }
        public string Cliente { get; set; } = null!;
        public string Tecnico { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public DateTime? HoraIngreso { get; set; }
        public DateTime? HoraSalida { get; set; }
        public string? ReporteFinal { get; set; }
        public double? LatitudIngreso { get; set; }
        public double? LongitudIngreso { get; set; }
        public double? LatitudSalida { get; set; }
        public double? LongitudSalida { get; set; }
        public string? GoogleMapsUrl { get; set; }
    }
}
