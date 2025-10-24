namespace Tickets.Api.DTOs.Clientes;

public class GetAllClientesDTO
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; } = null!;
    public string Contacto { get; set; } = null!;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public DateTime CreadoEl { get; set; }
}
