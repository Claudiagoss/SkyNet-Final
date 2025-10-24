using System.Text.Json.Serialization;

namespace Tickets.Api.DTOs.Tickets
{
    public class VisitaCompletadaDTO
    {
        public int TicketId { get; set; }
        public string Cliente { get; set; } = null!;
        public string Tecnico { get; set; } = null!;

        [JsonPropertyName("fechaLimite")]
        public DateTime? FechaLimite { get; set; }

        public DateTime? HoraIngreso { get; set; }
        public DateTime? HoraSalida { get; set; }
        public string? ReporteFinal { get; set; }
    }
}
