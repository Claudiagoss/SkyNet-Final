namespace Tickets.Api.Entidades;

public class EstadoTicket
{
    public int EstadoId { get; set; }
    public string Nombre { get; set; } = null!;
    public bool EsFinal { get; set; }
}
