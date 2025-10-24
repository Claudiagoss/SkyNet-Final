namespace Clientes.Api.Entidades;

public class Reporte
{
    public int ReporteId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public DateTime GeneradoEl { get; set; } = DateTime.UtcNow;
    public string RutaArchivo { get; set; } = string.Empty;
}
