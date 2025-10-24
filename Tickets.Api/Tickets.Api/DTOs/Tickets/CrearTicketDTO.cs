public class CrearTicketDTO
{
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int ClienteId { get; set; }
    public int ReportadoPorUsuarioId { get; set; }
    public int? AsignadoAUsuarioId { get; set; }
    public int EstadoId { get; set; }
    public int PrioridadId { get; set; }
    public DateTime? LimiteEl { get; set; }  // usar esto como fecha límite
    public double? LatitudIngreso { get; set; }
    public double? LongitudIngreso { get; set; }
}
