namespace Tickets.Api.DTOs.Catalogos;

public class GetAllPrioridadesDTO
{
    public int PrioridadId { get; set; }
    public string Nombre { get; set; } = null!;
    public int Peso { get; set; }
}
