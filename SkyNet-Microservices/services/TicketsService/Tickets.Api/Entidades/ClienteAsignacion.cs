namespace Tickets.Api.Entidades;

public enum TipoAsignacion : byte
{
    Directa = 1,
    PorDepartamento = 2
}

public class ClienteAsignacion
{
    public int ClienteAsignacionId { get; set; }
    public int ClienteId { get; set; }
    public int UsuarioId { get; set; }
    public TipoAsignacion Tipo { get; set; }
    public string? Departamento { get; set; }  // requerido si Tipo=PorDepartamento
    public bool Activo { get; set; } = true;
    public DateTime VigenteDesde { get; set; }
    public DateTime? VigenteHasta { get; set; }
    public DateTime CreadoEl { get; set; }
}

