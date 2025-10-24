using System.Net;
using System.Net.Mail;

namespace Clientes.Api.Servicios;

public interface IEmailService
{
    Task<bool> EnviarCorreoAsync(string destinatario, string asunto, string mensaje);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> EnviarCorreoAsync(string destinatario, string asunto, string mensaje)
    {
        try
        {
            var smtpServer = _config["Email:SmtpServer"];
            var port = int.Parse(_config["Email:Port"]);
            var username = _config["Email:Username"];
            var password = _config["Email:Password"];
            var from = _config["Email:From"];

            using var smtp = new SmtpClient(smtpServer)
            {
                Port = port,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(from, "SkyNet Soporte"),
                Subject = asunto,
                Body = mensaje,
                IsBodyHtml = true
            };

            mail.To.Add(destinatario);

            await smtp.SendMailAsync(mail);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"📧 Correo enviado a {destinatario}: {asunto}");
            Console.ResetColor();

            return true;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"❌ Error enviando correo: {ex.Message}");
            Console.ResetColor();
            return false;
        }
    }
}
