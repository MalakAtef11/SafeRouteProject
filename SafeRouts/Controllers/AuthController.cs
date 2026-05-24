using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;
using System.Text.Json;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
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

                // مهم: منع تسجيل دخول users من Google
                if (string.IsNullOrEmpty(user.PasswordHash))
                    return Unauthorized("This account was created using Google. Please login with Google.");

                if (user.PasswordHash.Trim() != password)
                    return Unauthorized("Invalid email or password");

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

                var user = new User
                {
                    FullName = request.FullName.Trim(),
                    Email = email,
                    BirthDate = request.BirthDate,
                    Gender = request.Gender.Trim(),
                    PasswordHash = request.Password, // لاحقاً اعملي hashing
                    UserType = "Citizen",
                    SectorID = null
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "User registered successfully",
                    userId = user.UserID
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
}