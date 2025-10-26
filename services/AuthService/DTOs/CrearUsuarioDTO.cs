namespace AuthService.DTOs
{
    public class CrearUsuarioDTO
    {
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = "";
        public string Email { get; set; } = null!;
        public string Telefono { get; set; } = "";
        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = "default";
        public int RolId { get; set; }
    }
}
