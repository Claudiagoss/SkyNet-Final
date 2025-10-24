using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Tickets.Api.Entidades;
using Tickets.Api.Repositorios;

namespace Tickets.Api.Servicios
{
    public interface IEmailService
    {
        Task<bool> EnviarCorreoAsync(string destinatario, string asunto, string cuerpoHtml);
        Task NotificarCierreAsync(Ticket ticket, IRepositorioCliente repoCli, IAuthClientService authClient, AppDbContext db);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        // ================================================================
        // 🔹 Enviar correo genérico
        // ================================================================
        public async Task<bool> EnviarCorreoAsync(string destinatario, string asunto, string cuerpoHtml)
        {
            try
            {
                var smtpServer = _config["Email:SmtpServer"];
                var port = int.Parse(_config["Email:Port"] ?? "587");
                var username = _config["Email:Username"];
                var password = _config["Email:Password"];
                var from = _config["Email:From"];

                if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                {
                    Console.WriteLine("❌ Configuración de correo incompleta en appsettings.json");
                    return false;
                }

                using var smtpClient = new SmtpClient(smtpServer)
                {
                    Port = port,
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = true
                };

                var mail = new MailMessage
                {
                    From = new MailAddress(from ?? username),
                    Subject = asunto,
                    Body = cuerpoHtml,
                    IsBodyHtml = true
                };
                mail.To.Add(destinatario);

                await smtpClient.SendMailAsync(mail);
                Console.WriteLine($"✅ Correo enviado correctamente a {destinatario}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error enviando correo: {ex.Message}");
                return false;
            }
        }

        // ================================================================
        // 🔹 Notificar cierre de ticket (usado por TicketEndpoint)
        // ================================================================
        public async Task NotificarCierreAsync(Ticket ticket, IRepositorioCliente repoCli, IAuthClientService authClient, AppDbContext db)
        {
            try
            {
                var cliente = await repoCli.ObtenerPorId(ticket.ClienteId);
                var usuarios = await authClient.ObtenerDiccionarioUsuariosAsync();
var tecnicoNombre = usuarios.GetValueOrDefault<int, string>(ticket.AsignadoAUsuarioId ?? 0, "No asignado");


                var asunto = $"Reporte de visita técnica — Ticket #{ticket.TicketId}";
                var cuerpo = $@"
                    <h2>Reporte de visita técnica</h2>
                    <p><b>Cliente:</b> {cliente?.Nombre ?? "Sin cliente"}</p>
                    <p><b>Técnico asignado:</b> {tecnicoNombre}</p>
                    <p><b>Inicio:</b> {ticket.HoraIngreso?.ToLocalTime():g}</p>
                    <p><b>Fin:</b> {ticket.HoraSalida?.ToLocalTime():g}</p>
                    <hr><p><b>Reporte final:</b> {ticket.ReporteFinal ?? "Sin reporte final"}</p>
                    <p>— Sistema SkyNet S.A.</p>";

                bool enviado = false;
                if (!string.IsNullOrWhiteSpace(cliente?.Email))
                    enviado = await EnviarCorreoAsync(cliente.Email, asunto, cuerpo);

                db.ReportesVisita.Add(new ReporteVisita
                {
                    TicketId = ticket.TicketId,
                    ClienteEmail = cliente?.Email,
                    TecnicoNombre = tecnicoNombre,
                    Asunto = asunto,
                    Contenido = cuerpo,
                    Enviado = enviado
                });

                await db.SaveChangesAsync();
                Console.WriteLine($"✅ Notificación enviada para ticket #{ticket.TicketId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en NotificarCierreAsync: {ex.Message}");
            }
        }
    }
}
