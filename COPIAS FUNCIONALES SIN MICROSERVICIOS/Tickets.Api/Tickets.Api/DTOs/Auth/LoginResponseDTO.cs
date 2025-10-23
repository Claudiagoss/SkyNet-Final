namespace Tickets.Api.DTOs.Auth
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = null!;
        public string Username { get; set; } = null!;
        public int RolId { get; set; }
        public string RolNombre { get; set; } = null!;
    }
}
