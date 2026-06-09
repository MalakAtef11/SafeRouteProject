using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;
using SafeRoutes.Services;
using System.Text.Json;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, EmailService emailService, IConfiguration config)
        {
            _context = context;
            _emailService = emailService;
            _config = config;
        }

        // ================= LOGIN =================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest("البريد الإلكتروني وكلمة المرور مطلوبان");
                }

                var email = request.Email.Trim().ToLower();
                var password = request.Password.Trim();

                var user = await _context.Users
                    .Include(u => u.Sector)
                    .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                if (user == null)
                    return Unauthorized("Invalid email or password");

                // منع تسجيل دخول users من Google
                if (string.IsNullOrEmpty(user.PasswordHash))
                    return Unauthorized("This account was created using Google. Please login with Google.");

                if (user.PasswordHash.Trim() != password)
                    return Unauthorized("Invalid email or password");

                // التحقق من تأكيد البريد الإلكتروني
                if (user.IsEmailVerified == false)
                    return StatusCode(403, new { message = "يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.", code = "EMAIL_NOT_VERIFIED" });

                return Ok(new
                {
                    userId = user.UserID,
                    fullName = user.FullName,
                    email = user.Email,
                    userType = user.UserType,
                    sectorId = user.SectorID,
                    sectorName = user.Sector != null ? user.Sector.SectorName : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"LOGIN ERROR: {ex.Message}");
            }
        }

        // ================= REGISTER =================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.FullName) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.Gender) ||
                    request.BirthDate == default)
                {
                    return BadRequest("يرجى تعبئة جميع الحقول المطلوبة");
                }

                var email = request.Email.Trim().ToLower();

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                if (existingUser != null)
                    return BadRequest("Email already exists");

                // توليد توكن التحقق من البريد
                var verificationToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

                var user = new User
                {
                    FullName = request.FullName.Trim(),
                    Email = email,
                    BirthDate = request.BirthDate,
                    Gender = request.Gender.Trim(),
                    PasswordHash = request.Password,
                    UserType = "Citizen",
                    SectorID = null,
                    IsEmailVerified = false,
                    EmailVerificationToken = verificationToken,
                    EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // إرسال بريد التحقق
                try
                {
                    var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                    var verificationLink = $"{frontendUrl}/verify-email?token={verificationToken}";
                    var emailBody = _emailService.BuildVerificationEmail(user.FullName, verificationLink);
                    await _emailService.SendEmailAsync(email, "✅ تأكيد بريدك الإلكتروني - SafeRoute", emailBody);
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"[EMAIL WARNING] Could not send verification email: {emailEx.Message}");
                    // لا نوقف العملية لو فشل الإيميل
                }

                return Ok(new
                {
                    message = "تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.",
                    userId = user.UserID,
                    requiresVerification = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"REGISTER ERROR: {ex.Message}");
            }
        }

        // ================= GOOGLE LOGIN =================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Credential))
                    return BadRequest("Google credential is required");

                GoogleJsonWebSignature.Payload payload;

                try
                {
                    payload = await GoogleJsonWebSignature.ValidateAsync(
                        request.Credential,
                        new GoogleJsonWebSignature.ValidationSettings
                        {
                            Audience = new[]
                            {
                                "219879263868-e9l7p62afrisa4lh264dr21c97fqt59c.apps.googleusercontent.com"

                            }
                        });
                }
                catch
                {
                    return Unauthorized("Invalid Google token");
                }

                var email = payload.Email?.Trim().ToLower();

                if (string.IsNullOrWhiteSpace(email))
                    return BadRequest("Google account email not found");

                var user = await _context.Users
                    .Include(u => u.Sector)
                    .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                if (user == null)
                {
                    user = new User
                    {
                        FullName = string.IsNullOrWhiteSpace(payload.Name) ? "Google User" : payload.Name.Trim(),
                        Email = email,
                        PasswordHash = "",
                        UserType = "Citizen",
                        SectorID = null,
                        Gender = "Not Specified",
                        BirthDate = new DateTime(2000, 1, 1)
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    user = await _context.Users
                        .Include(u => u.Sector)
                        .FirstOrDefaultAsync(u => u.UserID == user.UserID);
                }

                return Ok(new
                {
                    userId = user!.UserID,
                    fullName = user.FullName,
                    email = user.Email,
                    userType = user.UserType,
                    sectorId = user.SectorID,
                    sectorName = user.Sector != null ? user.Sector.SectorName : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"GOOGLE LOGIN ERROR: {ex.Message}");
            }
        }

        // ================= FACEBOOK LOGIN =================
        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookLoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.AccessToken))
                    return BadRequest("Facebook access token is required");

                using var httpClient = new HttpClient();

                var fbResponse = await httpClient.GetAsync(
                    $"https://graph.facebook.com/me?fields=id,name,email&access_token={request.AccessToken}");

                if (!fbResponse.IsSuccessStatusCode)
                    return Unauthorized("Invalid Facebook token");

                var fbJson = await fbResponse.Content.ReadAsStringAsync();

                using var document = JsonDocument.Parse(fbJson);
                var root = document.RootElement;

                var email = root.TryGetProperty("email", out var emailElement)
                    ? emailElement.GetString()?.Trim().ToLower()
                    : null;

                var name = root.TryGetProperty("name", out var nameElement)
                    ? nameElement.GetString()?.Trim()
                    : "Facebook User";

                if (string.IsNullOrWhiteSpace(email))
                    return BadRequest("Facebook account email not found");

                var user = await _context.Users
                    .Include(u => u.Sector)
                    .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                if (user == null)
                {
                    user = new User
                    {
                        FullName = name!,
                        Email = email,
                        PasswordHash = "",
                        UserType = "Citizen",
                        SectorID = null,
                        Gender = "Not Specified",
                        BirthDate = new DateTime(2000, 1, 1)
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    user = await _context.Users
                        .Include(u => u.Sector)
                        .FirstOrDefaultAsync(u => u.UserID == user.UserID);
                }

                return Ok(new
                {
                    userId = user!.UserID,
                    fullName = user.FullName,
                    email = user.Email,
                    userType = user.UserType,
                    sectorId = user.SectorID,
                    sectorName = user.Sector != null ? user.Sector.SectorName : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"FACEBOOK LOGIN ERROR: {ex.Message}");
            }
        }
        // ================= GET USER DATA =================
        // يضيف إمكانية جلب بيانات المستخدم لصفحة البروفايل
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Sector)
                    .FirstOrDefaultAsync(u => u.UserID == id);

                if (user == null)
                    return NotFound("المستخدم غير موجود");

                return Ok(new
                {
                    userId = user.UserID,
                    fullName = user.FullName,
                    email = user.Email,
                    birthDate = user.BirthDate,
                    gender = user.Gender,
                    userType = user.UserType,
                    sectorName = user.Sector?.SectorName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ERROR: {ex.Message}");
            }
        }

        // ================= UPDATE PROFILE =================
        // يضيف إمكانية تحديث البيانات من صفحة EditProfile
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound("المستخدم غير موجود");

                // تحديث البيانات فقط إذا تم إرسالها
                if (!string.IsNullOrWhiteSpace(request.FullName))
                    user.FullName = request.FullName.Trim();

                if (!string.IsNullOrWhiteSpace(request.Email))
                    user.Email = request.Email.Trim().ToLower();

                user.BirthDate = request.BirthDate;
                user.Gender = request.Gender;

                await _context.SaveChangesAsync();

                return Ok(new { message = "تم تحديث البيانات بنجاح ✅" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"UPDATE ERROR: {ex.Message}");
            }
        }


        // ================= FORGOT PASSWORD =================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email))
                    return BadRequest("البريد الإلكتروني مطلوب");

                var email = request.Email.Trim().ToLower();
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                // نرجع نفس الرسالة سواء وجدنا المستخدم أم لا (أمان)
                if (user == null || string.IsNullOrEmpty(user.PasswordHash))
                    return Ok(new { message = "إذا كان البريد مسجلاً، ستصل رسالة قريباً." });

                // توليد توكن إعادة التعيين
                var resetToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await _context.SaveChangesAsync();

                // إرسال البريد
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";
                var emailBody = _emailService.BuildPasswordResetEmail(user.FullName, resetLink);
                await _emailService.SendEmailAsync(email, "🔑 إعادة تعيين كلمة المرور - SafeRoute", emailBody);

                return Ok(new { message = "إذا كان البريد مسجلاً، ستصل رسالة قريباً." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"FORGOT PASSWORD ERROR: {ex.Message}");
            }
        }

        // ================= RESET PASSWORD =================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Token) || string.IsNullOrWhiteSpace(request?.NewPassword))
                    return BadRequest("التوكن وكلمة المرور الجديدة مطلوبان");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

                if (user == null)
                    return BadRequest("رابط إعادة التعيين غير صالح");

                if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
                    return BadRequest("انتهت صلاحية الرابط. يرجى طلب رابط جديد.");

                // تحديث كلمة المرور
                user.PasswordHash = request.NewPassword;
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم تغيير كلمة المرور بنجاح! يمكنك الدخول الآن." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"RESET PASSWORD ERROR: {ex.Message}");
            }
        }

        // ================= VERIFY EMAIL =================
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Token))
                    return BadRequest("التوكن مطلوب");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == request.Token);

                if (user == null)
                    return BadRequest("رابط التحقق غير صالح");

                if (user.IsEmailVerified == true)
                    return Ok(new { message = "البريد الإلكتروني مؤكد مسبقاً." });

                if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                    return BadRequest("انتهت صلاحية الرابط. يرجى طلب رابط جديد.");

                // تأكيد البريد
                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الدخول الآن." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"VERIFY EMAIL ERROR: {ex.Message}");
            }
        }

        // ================= RESEND VERIFICATION =================
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email))
                    return BadRequest("البريد الإلكتروني مطلوب");

                var email = request.Email.Trim().ToLower();
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email);

                if (user == null || user.IsEmailVerified == true)
                    return Ok(new { message = "إذا كان البريد يحتاج للتحقق، ستصل رسالة قريباً." });

                // توليد توكن جديد
                var newToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                user.EmailVerificationToken = newToken;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
                await _context.SaveChangesAsync();

                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                var verificationLink = $"{frontendUrl}/verify-email?token={newToken}";
                var emailBody = _emailService.BuildVerificationEmail(user.FullName, verificationLink);
                await _emailService.SendEmailAsync(email, "✅ تأكيد بريدك الإلكتروني - SafeRoute", emailBody);

                return Ok(new { message = "تم إرسال رسالة التحقق. تحقق من صندوق الوارد." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"RESEND VERIFICATION ERROR: {ex.Message}");
            }
        }
    }

    // ================= DTOs =================
    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
    // أضف هذا الـ DTO في أسفل الملف مع الـ Requests الأخرى
    public class UpdateRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Gender { get; set; }
    }
    public class RegisterRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? Password { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string? Credential { get; set; }
    }

    public class FacebookLoginRequest
    {
        public string? AccessToken { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string? Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
    }

    public class VerifyEmailRequest
    {
        public string? Token { get; set; }
    }
}