using System.Collections.Generic;

namespace AuthService.Entidades
{
    public class Rol
    {
        public int RolId { get; set; }
        public string Nombre { get; set; } = null!;

        public ICollection<RolPermiso> RolPermisos { get; set; } = new List<RolPermiso>();
    }
}
