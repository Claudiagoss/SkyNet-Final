using System.ComponentModel.DataAnnotations.Schema;

namespace Tickets.Api.Entidades
{
    public class Ticket
    {
        public int TicketId { get; set; }

        public string Titulo { get; set; } = null!;
        public string Descripcion { get; set; } = null!;

        public int ClienteId { get; set; }
        [ForeignKey("ClienteId")]
        public Cliente Cliente { get; set; } = null!;

       
        public int ReportadoPorUsuarioId { get; set; }

     
        public int? AsignadoAUsuarioId { get; set; } // USUARIO TÉCNICO

        public int? SupervisorId { get; set; }

        public int EstadoId { get; set; }
        public EstadoTicket Estado { get; set; } = null!;

        public int PrioridadId { get; set; }
        public PrioridadTicket Prioridad { get; set; } = null!;

        public DateTime CreadoEl { get; set; }
        public DateTime? LimiteEl { get; set; }
        public DateTime? CerradoEl { get; set; }

        // ✅ 📍 GEOLOCALIZACIÓN - NUEVO BLOQUE VISITAS
        public DateTime? ActualizadoEl { get; set; }

        public DateTime? HoraIngreso { get; set; }
        public double? LatitudIngreso { get; set; }
        public double? LongitudIngreso { get; set; }

        public DateTime? HoraSalida { get; set; }
        public double? LatitudSalida { get; set; }
        public double? LongitudSalida { get; set; }

        // ✅ Reporte de cierre (se enviará por correo al cliente)
        public string? ReporteFinal { get; set; }
        public DateTime? HoraProgramada { get; set; } // ✅ Nueva propiedad

    }
}
