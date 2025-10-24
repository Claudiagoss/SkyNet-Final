namespace AuthService.DTOs
{
    public class CrearUsuarioDTO
    {
        public string Nombre { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int RolId { get; set; }
    }
}
