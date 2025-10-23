using System.Collections.Generic;

namespace AuthService.Entidades
{
    public class Permiso
    {
        public int PermisoId { get; set; }
        public string Nombre { get; set; } = null!;

        public ICollection<RolPermiso> RolPermisos { get; set; } = new List<RolPermiso>();
    }
}
