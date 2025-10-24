namespace AuthService.Entidades
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public bool EsActivo { get; set; } = true;

        // 🔗 Relaciones
        public int RolId { get; set; }
        public Rol Rol { get; set; } = null!;
    }
}
