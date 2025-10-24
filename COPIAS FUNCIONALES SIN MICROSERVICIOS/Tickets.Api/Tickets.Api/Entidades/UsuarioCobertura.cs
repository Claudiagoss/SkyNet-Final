namespace Tickets.Api.Entidades;

public class UsuarioCobertura
{
    public int UsuarioCoberturaId { get; set; }
    public int UsuarioId { get; set; }
    public string Departamento { get; set; } = null!;
    public int Prioridad { get; set; } = 100;
    public bool Activo { get; set; } = true;
    public DateTime CreadoEl { get; set; } 
}
