using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tickets.Api.Entidades
{
    [Table("ReportesVisita", Schema = "dbo")]
    public class ReporteVisita
    {
        [Key]
        [Column("ReporteId")]
        public int ReporteVisitaId { get; set; }

        public int TicketId { get; set; }
        public int ClienteId { get; set; }

        [Column("FechaReporte")]
        public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string Asunto { get; set; } = string.Empty;

        [MaxLength(4000)]
        public string Contenido { get; set; } = string.Empty;

        public bool Enviado { get; set; } = false;

        [Column("CorreoDestino")]
        [MaxLength(200)]
        public string ClienteEmail { get; set; } = string.Empty;

        [NotMapped]
        public string TecnicoNombre { get; set; } = string.Empty;

        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }
    }
}
