namespace Tickets.Api.DTOs.Usuarios;

public class GetAllUsuariosDTO
{
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Telefono { get; set; } = null!;
    public string Username { get; set; } = null!;
    public int RolId { get; set; }
    public bool EsActivo { get; set; }
}
