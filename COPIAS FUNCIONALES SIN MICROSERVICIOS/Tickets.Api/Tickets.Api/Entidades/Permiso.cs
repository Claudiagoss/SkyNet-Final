namespace Tickets.Api.Entidades;

public class Permiso
{
    public int PermisoId { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
}
