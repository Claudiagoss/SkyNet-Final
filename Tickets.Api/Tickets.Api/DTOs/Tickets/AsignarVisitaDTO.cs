namespace Tickets.Api.DTOs.Tickets
{
    public class AsignarVisitaDTO
    {
        public int ClienteId { get; set; }
        public int TecnicoId { get; set; }
        public DateTime FechaProgramada { get; set; }
        public string? Notas { get; set; }
    }
}
