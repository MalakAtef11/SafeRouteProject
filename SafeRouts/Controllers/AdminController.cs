using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ================= GET STATISTICS =================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var citizensCount = await _context.Users.CountAsync(u => u.UserType == "Citizen");
                var sectorEmployeesCount = await _context.Users.CountAsync(u => u.UserType == "Sector");
                var adminCount = await _context.Users.CountAsync(u => u.UserType == "Admin");

                var totalReports = await _context.Reports.CountAsync();
                var newReports = await _context.Reports.CountAsync(r => r.CurrentStatus.StatusCode == "New");
                var processingReports = await _context.Reports.CountAsync(r => r.CurrentStatus.StatusCode == "Processing");
                var resolvedReports = await _context.Reports.CountAsync(r => r.CurrentStatus.StatusCode == "Resolved");
                var rejectedReports = await _context.Reports.CountAsync(r => r.CurrentStatus.StatusCode == "Rejected");

                var totalSectors = await _context.Sectors.CountAsync();

                return Ok(new
                {
                    users = new { total = totalUsers, citizens = citizensCount, employees = sectorEmployeesCount, admins = adminCount },
                    reports = new { total = totalReports, @new = newReports, processing = processingReports, resolved = resolvedReports, rejected = rejectedReports },
                    sectors = new { total = totalSectors }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"STATS ERROR: {ex.Message}");
            }
        }

        // ================= USERS MANAGEMENT =================

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.Sector)
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new
                    {
                        userId = u.UserID,
                        fullName = u.FullName,
                        email = u.Email,
                        birthDate = u.BirthDate,
                        gender = u.Gender,
                        userType = u.UserType,
                        sectorId = u.SectorID,
                        sectorName = u.Sector != null ? u.Sector.SectorName : null,
                        authProvider = u.AuthProvider,
                        isActive = u.IsActive,
                        role = u.Role,
                        isEmailVerified = u.IsEmailVerified ?? false,
                        createdAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"GET USERS ERROR: {ex.Message}");
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound("User not found");

                if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
                if (!string.IsNullOrWhiteSpace(request.Email)) user.Email = request.Email.Trim().ToLower();
                if (!string.IsNullOrWhiteSpace(request.UserType)) user.UserType = request.UserType.Trim();
                
                user.SectorID = request.SectorID;
                user.IsActive = request.IsActive;
                user.Role = request.Role;
                user.IsEmailVerified = request.IsEmailVerified;

                if (request.BirthDate.HasValue) user.BirthDate = request.BirthDate.Value;
                if (!string.IsNullOrWhiteSpace(request.Gender)) user.Gender = request.Gender.Trim();

                await _context.SaveChangesAsync();
                return Ok(new { message = "تم تحديث المستخدم بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"UPDATE USER ERROR: {ex.Message}");
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound("User not found");

                // حذف الإشعارات أولاً
                var notifications = await _context.Notifications.Where(n => n.UserID == id).ToListAsync();
                _context.Notifications.RemoveRange(notifications);

                // إذا كان المواطن هو صاحب بلاغات، يجب حذف بلاغاته وكل ما يتعلق بها
                var citizenReports = await _context.Reports.Where(r => r.CitizenUserID == id).ToListAsync();
                foreach (var report in citizenReports)
                {
                    var reportSectors = await _context.ReportSectors.Where(rs => rs.ReportID == report.ReportID).ToListAsync();
                    _context.ReportSectors.RemoveRange(reportSectors);

                    var histories = await _context.ReportStatusHistories.Where(h => h.ReportID == report.ReportID).ToListAsync();
                    _context.ReportStatusHistories.RemoveRange(histories);

                    var assignments = await _context.ReportAssignments.Where(a => a.ReportID == report.ReportID).ToListAsync();
                    _context.ReportAssignments.RemoveRange(assignments);

                    var notes = await _context.InternalNotes.Where(n => n.ReportID == report.ReportID).ToListAsync();
                    _context.InternalNotes.RemoveRange(notes);

                    var rNotifications = await _context.Notifications.Where(n => n.ReportID == report.ReportID).ToListAsync();
                    _context.Notifications.RemoveRange(rNotifications);

                    _context.Reports.Remove(report);
                }

                // حذف المهام والنشاطات المسندة إلى الموظف إذا كان موظف قطاع
                var employeeAssignmentsFrom = await _context.ReportAssignments.Where(a => a.AssignedByUserID == id).ToListAsync();
                _context.ReportAssignments.RemoveRange(employeeAssignmentsFrom);

                var employeeAssignmentsTo = await _context.ReportAssignments.Where(a => a.AssignedToUserID == id).ToListAsync();
                _context.ReportAssignments.RemoveRange(employeeAssignmentsTo);

                var employeeNotes = await _context.InternalNotes.Where(n => n.CreatedByUserID == id).ToListAsync();
                _context.InternalNotes.RemoveRange(employeeNotes);

                var employeeHistories = await _context.ReportStatusHistories.Where(h => h.ChangedByUserID == id).ToListAsync();
                _context.ReportStatusHistories.RemoveRange(employeeHistories);

                await _context.SaveChangesAsync();

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم حذف الحساب بالكامل وكل البيانات المتعلقة به بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DELETE USER ERROR: {ex.Message}");
            }
        }

        // ================= REPORTS MANAGEMENT =================

        [HttpGet("reports")]
        public async Task<IActionResult> GetAllReports()
        {
            try
            {
                var reports = await _context.Reports
                    .Include(r => r.CitizenUser)
                    .Include(r => r.CurrentStatus)
                    .Include(r => r.Priority)
                    .Include(r => r.ReportSectors)
                    .ThenInclude(rs => rs.Sector)
                    .OrderByDescending(r => r.SubmittedAt)
                    .Select(r => new
                    {
                        reportId = r.ReportID,
                        title = r.Title,
                        description = r.Description,
                        addressText = r.AddressText,
                        city = r.City,
                        reportType = r.ReportType,
                        submittedAt = r.SubmittedAt,
                        imageUrl = r.ImageUrl,
                        audioUrl = r.AudioUrl,
                        citizenName = r.CitizenUser != null ? r.CitizenUser.FullName : "مجهول",
                        statusName = r.CurrentStatus != null ? r.CurrentStatus.StatusName : "غير محدد",
                        statusCode = r.CurrentStatus != null ? r.CurrentStatus.StatusCode : "New",
                        priorityName = r.Priority != null ? r.Priority.PriorityName : "متوسط",
                        sectors = r.ReportSectors.Select(rs => new { id = rs.SectorID, name = rs.Sector.SectorName })
                    })
                    .ToListAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"GET REPORTS ERROR: {ex.Message}");
            }
        }

        [HttpDelete("reports/{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            try
            {
                var report = await _context.Reports.FindAsync(id);
                if (report == null) return NotFound("Report not found");

                var notifications = await _context.Notifications.Where(n => n.ReportID == id).ToListAsync();
                _context.Notifications.RemoveRange(notifications);

                var reportSectors = await _context.ReportSectors.Where(rs => rs.ReportID == id).ToListAsync();
                _context.ReportSectors.RemoveRange(reportSectors);

                var histories = await _context.ReportStatusHistories.Where(h => h.ReportID == id).ToListAsync();
                _context.ReportStatusHistories.RemoveRange(histories);

                var assignments = await _context.ReportAssignments.Where(a => a.ReportID == id).ToListAsync();
                _context.ReportAssignments.RemoveRange(assignments);

                var notes = await _context.InternalNotes.Where(n => n.ReportID == id).ToListAsync();
                _context.InternalNotes.RemoveRange(notes);

                await _context.SaveChangesAsync();

                _context.Reports.Remove(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم حذف البلاغ بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DELETE REPORT ERROR: {ex.Message}");
            }
        }

        // ================= SECTORS MANAGEMENT =================

        [HttpGet("sectors")]
        public async Task<IActionResult> GetSectors()
        {
            try
            {
                var sectors = await _context.Sectors
                    .OrderBy(s => s.SectorName)
                    .ToListAsync();
                return Ok(sectors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"GET SECTORS ERROR: {ex.Message}");
            }
        }

        [HttpPost("sectors")]
        public async Task<IActionResult> CreateSector([FromBody] SectorRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.SectorName))
                    return BadRequest("اسم القطاع مطلوب");

                var sector = new Sector
                {
                    SectorName = request.SectorName.Trim(),
                    Description = request.Description?.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Sectors.Add(sector);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم إضافة القطاع بنجاح", sectorId = sector.SectorID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"CREATE SECTOR ERROR: {ex.Message}");
            }
        }

        [HttpPut("sectors/{id}")]
        public async Task<IActionResult> UpdateSector(int id, [FromBody] SectorRequest request)
        {
            try
            {
                var sector = await _context.Sectors.FindAsync(id);
                if (sector == null) return NotFound("Sector not found");

                if (!string.IsNullOrWhiteSpace(request.SectorName))
                    sector.SectorName = request.SectorName.Trim();

                sector.Description = request.Description?.Trim();
                sector.IsActive = request.IsActive;

                await _context.SaveChangesAsync();
                return Ok(new { message = "تم تحديث القطاع بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"UPDATE SECTOR ERROR: {ex.Message}");
            }
        }

        [HttpDelete("sectors/{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            try
            {
                var sector = await _context.Sectors.FindAsync(id);
                if (sector == null) return NotFound("Sector not found");

                // تحديث المستخدمين الذين ينتمون لهذا القطاع
                var users = await _context.Users.Where(u => u.SectorID == id).ToListAsync();
                foreach (var u in users)
                {
                    u.SectorID = null;
                }

                // مسح القطاع من البلاغات المتعددة
                var reportSectors = await _context.ReportSectors.Where(rs => rs.SectorID == id).ToListAsync();
                _context.ReportSectors.RemoveRange(reportSectors);

                await _context.SaveChangesAsync();

                _context.Sectors.Remove(sector);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم حذف القطاع بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"DELETE SECTOR ERROR: {ex.Message}");
            }
        }

        // ================= CREATE USER =================
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.PasswordHash) || string.IsNullOrWhiteSpace(request.FullName))
                {
                    return BadRequest("Email, Password, and Full Name are required.");
                }

                var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
                if (exists)
                {
                    return BadRequest("Email already registered.");
                }

                var user = new User
                {
                    FullName = request.FullName.Trim(),
                    Email = request.Email.Trim().ToLower(),
                    PasswordHash = request.PasswordHash, // stores plain text per system logic
                    UserType = request.UserType.Trim(),
                    SectorID = request.UserType == "Sector" ? request.SectorID : null,
                    IsActive = request.IsActive,
                    Role = request.Role,
                    IsEmailVerified = request.IsEmailVerified,
                    AuthProvider = "Local",
                    CreatedAt = DateTime.UtcNow
                };

                if (request.BirthDate.HasValue) user.BirthDate = request.BirthDate.Value;
                if (!string.IsNullOrWhiteSpace(request.Gender)) user.Gender = request.Gender.Trim();

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "تم إنشاء المستخدم بنجاح", userId = user.UserID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"CREATE USER ERROR: {ex.Message}");
            }
        }

        // ================= AI PROMPT MANAGEMENT =================
        [HttpGet("prompt")]
        public IActionResult GetPrompt()
        {
            try
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ai_prompt.txt");
                if (System.IO.File.Exists(filePath))
                {
                    var content = System.IO.File.ReadAllText(filePath);
                    return Ok(new { prompt = content });
                }
                return Ok(new { prompt = OpenAIService.DefaultSystemPrompt });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"GET PROMPT ERROR: {ex.Message}");
            }
        }

        [HttpPost("prompt")]
        public IActionResult SavePrompt([FromBody] PromptUpdateRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Prompt))
                {
                    return BadRequest("Prompt cannot be empty");
                }

                var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                if (!Directory.Exists(dirPath))
                {
                    Directory.CreateDirectory(dirPath);
                }

                var filePath = Path.Combine(dirPath, "ai_prompt.txt");
                System.IO.File.WriteAllText(filePath, request.Prompt);
                return Ok(new { message = "تم حفظ البرومبت بنجاح" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"SAVE PROMPT ERROR: {ex.Message}");
            }
        }
    }

    // ================= DTOs =================

    public class AdminUpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? UserType { get; set; }
        public int? SectorID { get; set; }
        public bool IsActive { get; set; }
        public string? Role { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
    }

    public class AdminCreateUserRequest
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string UserType { get; set; } = "Citizen";
        public int? SectorID { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Role { get; set; }
        public bool IsEmailVerified { get; set; } = true;
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
    }

    public class SectorRequest
    {
        public string? SectorName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class PromptUpdateRequest
    {
        public string Prompt { get; set; } = null!;
    }
}
