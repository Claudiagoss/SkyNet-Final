using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Clientes.Api.Entidades;

public class Notificacion
{
    [Key]
    public int NotificacionId { get; set; }

    [Required]
    public string Asunto { get; set; } = string.Empty;

    [Required]
    public string Mensaje { get; set; } = string.Empty;

    public DateTime EnviadaEl { get; set; }

    // 🔹 Relación con Cliente
    public int ClienteId { get; set; }

    [ForeignKey("ClienteId")]
    public Cliente? Cliente { get; set; }   // 👈 Nota el signo de interrogación (opcional)
}
