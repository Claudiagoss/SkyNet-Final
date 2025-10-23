namespace Tickets.Api.DTOs.Tickets
{
    public class VisitaCheckOutDTO
    {
        public int TicketId { get; set; }
        public double LatitudSalida { get; set; }
        public double LongitudSalida { get; set; }
        public string? ReporteFinal { get; set; }
    }
}
