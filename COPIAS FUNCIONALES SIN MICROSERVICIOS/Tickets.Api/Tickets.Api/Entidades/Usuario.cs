namespace Tickets.Api.Entidades;

public class Usuario
{
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Telefono { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public int RolId { get; set; }
    public bool EsActivo { get; set; }           // default en BD
    public DateTime CreadoEl { get; set; }       // default en BD
    public DateTime? ActualizadoEl { get; set; } // queda null
}
