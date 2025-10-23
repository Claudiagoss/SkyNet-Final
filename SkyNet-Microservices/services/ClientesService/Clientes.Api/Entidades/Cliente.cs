using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;  

namespace Clientes.Api.Entidades;

public class Cliente
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double? Latitud { get; set; }
    public double? Longitud { get; set; }

     [JsonIgnore] 
    public List<Notificacion>? Notificaciones { get; set; }
}
