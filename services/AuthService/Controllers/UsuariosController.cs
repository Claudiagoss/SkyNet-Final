using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Entidades;
using AuthService.Repositorios;
using AuthService.DTOs;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IRepositorioUsuario _repo;

        public UsuariosController(IRepositorioUsuario repo)
        {
            _repo = repo;
        }

        // ===========================================
        // 🔹 GET: /api/usuarios
        // ===========================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            var usuarios = await _repo.ObtenerTodos();
            return Ok(usuarios);
        }

        // ===========================================
        // 🔹 GET: /api/usuarios/{id}
        // ===========================================
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _repo.ObtenerPorId(id);
            if (usuario == null)
                return NotFound();
            return Ok(usuario);
        }

        // ===========================================
        // 🔹 POST: /api/usuarios
        // ===========================================
        [HttpPost]
        public async Task<ActionResult<Usuario>> CrearUsuario([FromBody] CrearUsuarioDTO dto)
        {
            try
            {
                Console.WriteLine($"🟢 [POST] Creando usuario: {dto.Nombre} - {dto.Email} - Rol: {dto.RolId}");

                if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest("Nombre y Email son obligatorios.");

               var usuario = new Usuario
{
    Nombre = dto.Nombre,
    Apellido = dto.Apellido ?? "",
    Email = dto.Email,
    Telefono = dto.Telefono ?? "N/A",
    Username = string.IsNullOrWhiteSpace(dto.Username)
        ? dto.Email.Split('@')[0]
        : dto.Username,
    PasswordHash = string.IsNullOrWhiteSpace(dto.PasswordHash)
        ? "default123"
        : dto.PasswordHash,
    EsActivo = true,
    RolId = dto.RolId == 0 ? 2 : dto.RolId
};


                var creado = await _repo.Crear(usuario);
                Console.WriteLine($"✅ Usuario creado con ID: {creado.UsuarioId}");
                return CreatedAtAction(nameof(GetUsuario), new { id = creado.UsuarioId }, creado);
            }
            catch (DbUpdateException dbEx)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error de base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
                Console.ResetColor();
                return Problem($"Error al guardar usuario: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error general al crear usuario: {ex.Message}");
                Console.ResetColor();
                return Problem($"Error interno: {ex.Message}");
            }
        }

        // ===========================================
        // 🔹 PUT: /api/usuarios/{id}
        // ===========================================
        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] Usuario usuario)
        {
            if (id != usuario.UsuarioId)
            {
                Console.WriteLine($"⚠️ ID de URL ({id}) no coincide con UsuarioId ({usuario.UsuarioId})");
                return BadRequest("El ID del usuario no coincide.");
            }

            try
            {
                usuario.Username ??= usuario.Email?.Split('@')[0] ?? "usuario";
                usuario.PasswordHash ??= "default123";
                usuario.Apellido ??= "";
                usuario.Telefono ??= "N/A";

                var actualizado = await _repo.Actualizar(usuario);
                if (!actualizado)
                    return NotFound($"Usuario con ID {id} no encontrado.");

                Console.WriteLine($"✅ Usuario actualizado correctamente (ID: {id})");
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error al actualizar usuario: {dbEx.InnerException?.Message ?? dbEx.Message}");
                Console.ResetColor();
                return Problem($"Error al actualizar usuario: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error general al actualizar usuario: {ex.Message}");
                Console.ResetColor();
                return Problem($"Error interno: {ex.Message}");
            }
        }

        // ===========================================
        // 🔹 DELETE: /api/usuarios/{id}
        // ===========================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            try
            {
                var eliminado = await _repo.Borrar(id);
                if (!eliminado)
                {
                    Console.WriteLine($"⚠️ Usuario con ID {id} no encontrado para eliminar.");
                    return NotFound();
                }

                Console.WriteLine($"🗑️ Usuario con ID {id} eliminado correctamente.");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error al eliminar usuario: {ex.Message}");
                Console.ResetColor();
                return Problem($"Error interno al eliminar usuario: {ex.Message}");
            }
        }
    }
}
