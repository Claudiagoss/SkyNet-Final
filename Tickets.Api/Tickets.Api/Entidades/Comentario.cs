namespace Tickets.Api.Entidades;

public class Comentario
{
    public int ComentarioId { get; set; }
    public int TicketId { get; set; }
    public int UsuarioId { get; set; }
    public string Texto { get; set; } = null!;
    public bool EsInterno { get; set; }   // default en BD
    public DateTime CreadoEl { get; set; } // default en BD
}
