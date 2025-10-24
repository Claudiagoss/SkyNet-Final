namespace Tickets.Api.DTOs.Catalogos;

public class GetAllEstadosDTO
{
    public int EstadoId { get; set; }
    public string Nombre { get; set; } = null!;
    public bool EsFinal { get; set; }
}
