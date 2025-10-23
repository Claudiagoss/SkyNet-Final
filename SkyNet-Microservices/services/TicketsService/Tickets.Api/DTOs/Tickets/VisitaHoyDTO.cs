using System.Text.Json.Serialization;

namespace Tickets.Api.DTOs.Tickets
{
    public class VisitaHoyDTO
    {
        public int TicketId { get; set; }
        public string Cliente { get; set; } = null!;
        public string Tecnico { get; set; } = null!;
        public string? Titulo { get; set; }

        [JsonPropertyName("fechaLimite")]
        public DateTime? FechaLimite { get; set; }

        public string? Estado { get; set; }
        public string? GoogleMapsUrl { get; set; }
    }
}
