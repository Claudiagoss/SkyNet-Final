namespace Tickets.Api.DTOs.Comentarios;

public class GetAllComentariosDTO
{
    public int ComentarioId { get; set; }
    public int TicketId { get; set; }
    public int UsuarioId { get; set; }
    public string? UsuarioNombre { get; set; }
    public string Texto { get; set; } = null!;
    public bool EsInterno { get; set; }
    public DateTime CreadoEl { get; set; }
}
