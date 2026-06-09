using System.Net;
using System.Net.Mail;

namespace SafeRoutes.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var smtpServer = _config["Email:SmtpServer"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
                var smtpUsername = _config["Email:SmtpUsername"];
                var smtpPassword = _config["Email:SmtpPassword"];
                var senderEmail = _config["Email:SenderEmail"] ?? smtpUsername;
                var senderName = _config["Email:SenderName"] ?? "SafeRoute";

                if (string.IsNullOrWhiteSpace(smtpUsername) || string.IsNullOrWhiteSpace(smtpPassword))
                {
                    // Dev mode: log to console instead of sending
                    _logger.LogWarning("📧 [DEV MODE - EMAIL NOT SENT] To: {To} | Subject: {Subject}", toEmail, subject);
                    _logger.LogInformation("📧 Email Body:\n{Body}", htmlBody);
                    return;
                }

                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 15000
                };

                using var message = new MailMessage
                {
                    From = new MailAddress(senderEmail!, senderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(new MailAddress(toEmail));

                await client.SendMailAsync(message);
                _logger.LogInformation("✅ Email sent to {To}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError("❌ Email failed to {To}: {Error}", toEmail, ex.Message);
                throw;
            }
        }

        // ── Email Templates ──

        public string BuildVerificationEmail(string fullName, string verificationLink)
        {
            return $@"
<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0;padding:0;background:#f4f7fc;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f7fc;padding:40px 20px;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>
        <tr>
          <td style='background:linear-gradient(135deg,#0071e3,#005bb5);padding:40px;text-align:center;'>
            <h1 style='color:#fff;margin:0;font-size:28px;'>SafeRoute 🛡️</h1>
            <p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;'>منظومة الإبلاغ الذكي</p>
          </td>
        </tr>
        <tr>
          <td style='padding:45px 40px;text-align:right;'>
            <h2 style='color:#1e293b;font-size:22px;margin:0 0 15px;'>مرحباً {fullName}! 👋</h2>
            <p style='color:#64748b;font-size:16px;line-height:1.8;margin:0 0 30px;'>
              شكراً لتسجيلك في SafeRoute. يرجى تأكيد بريدك الإلكتروني للبدء في استخدام المنصة.
            </p>
            <div style='text-align:center;margin:35px 0;'>
              <a href='{verificationLink}' 
                 style='background:#0071e3;color:#fff;padding:16px 45px;border-radius:99px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;box-shadow:0 8px 20px rgba(0,113,227,0.35);'>
                ✅ تأكيد البريد الإلكتروني
              </a>
            </div>
            <p style='color:#94a3b8;font-size:13px;text-align:center;margin:20px 0 0;'>
              هذا الرابط صالح لمدة 24 ساعة فقط.<br>
              إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.
            </p>
          </td>
        </tr>
        <tr>
          <td style='background:#f8fafc;padding:25px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
            <p style='color:#94a3b8;font-size:12px;margin:0;'>© 2026 SafeRoute | جامعة الزيتونة الأردنية</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }

        public string BuildPasswordResetEmail(string fullName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
<body style='margin:0;padding:0;background:#f4f7fc;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f7fc;padding:40px 20px;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>
        <tr>
          <td style='background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;'>
            <h1 style='color:#fff;margin:0;font-size:28px;'>SafeRoute 🔐</h1>
            <p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;'>إعادة تعيين كلمة المرور</p>
          </td>
        </tr>
        <tr>
          <td style='padding:45px 40px;text-align:right;'>
            <h2 style='color:#1e293b;font-size:22px;margin:0 0 15px;'>مرحباً {fullName}،</h2>
            <p style='color:#64748b;font-size:16px;line-height:1.8;margin:0 0 30px;'>
              استلمنا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في SafeRoute.
              اضغط على الزر أدناه لإنشاء كلمة مرور جديدة.
            </p>
            <div style='text-align:center;margin:35px 0;'>
              <a href='{resetLink}' 
                 style='background:#ef4444;color:#fff;padding:16px 45px;border-radius:99px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;box-shadow:0 8px 20px rgba(239,68,68,0.35);'>
                🔑 إعادة تعيين كلمة المرور
              </a>
            </div>
            <div style='background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin-top:25px;'>
              <p style='color:#dc2626;font-size:13px;margin:0;text-align:center;'>
                ⚠️ هذا الرابط صالح لمدة ساعة واحدة فقط.<br>
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style='background:#f8fafc;padding:25px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
            <p style='color:#94a3b8;font-size:12px;margin:0;'>© 2026 SafeRoute | جامعة الزيتونة الأردنية</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }
    }
}
