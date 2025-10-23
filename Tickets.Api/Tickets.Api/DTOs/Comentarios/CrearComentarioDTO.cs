namespace Tickets.Api.DTOs.Comentarios;

public class CrearComentarioDTO
{
    public int UsuarioId { get; set; }
    public string Texto { get; set; } = null!;
    public bool EsInterno { get; set; } = false;
}
