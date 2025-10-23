
namespace Tickets.Api.Entidades;

public class Rol
{
    public int RolId { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public DateTime CreadoEl { get; set; }  
}
