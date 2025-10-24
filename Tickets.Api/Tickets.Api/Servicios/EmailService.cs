using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace Tickets.Api.Servicios
{
    public interface IEmailService
    {
        Task<bool> EnviarCorreoAsync(string destinatario, string asunto, string cuerpoHtml);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

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
                    From = new MailAddress(from),
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
    }
}
