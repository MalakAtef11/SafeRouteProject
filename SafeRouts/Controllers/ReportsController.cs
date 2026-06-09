using AutoMapper;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using SafeRoutes.Data;
using SafeRoutes.Models;
using System;
using System.Reflection.Metadata;
using System.Text.RegularExpressions;
using static System.Collections.Specialized.BitVector32;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;

namespace SafeRoutes.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ReportsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromForm] CreateReportRequest request)
        {
            var citizen = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == request.CitizenUserID && u.UserType == "Citizen");

            if (citizen == null)
                return BadRequest("Citizen user not found.");

            var newStatus = await _context.ReportStatuses
                .FirstOrDefaultAsync(s => s.StatusCode == "New");

            if (newStatus == null)
                return BadRequest("Default status 'New' not found.");

            // --- التعديل هون: تحديد درجة الخطورة بناءً على تحليل الـ AI أو القيمة الافتراضية ---
            int finalPriorityId;
            if (request.PriorityID.HasValue)
            {
                finalPriorityId = request.PriorityID.Value;
            }
            else
            {
                var mediumPriority = await _context.ReportPriorities
                    .FirstOrDefaultAsync(p => p.PriorityCode == "Medium");

                if (mediumPriority == null)
                    return BadRequest("Default priority 'Medium' not found.");

                finalPriorityId = mediumPriority.PriorityID;
            }
            // --------------------------------------------------------------------------

            string? imageUrl = null;
            string? audioUrl = null;

            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
            }

            var uploadsFolder = Path.Combine(webRootPath, "uploads", "reports");
            Directory.CreateDirectory(uploadsFolder);

            if (request.Image != null && request.Image.Length > 0)
            {
                var imageFileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Image.FileName)}";
                var imagePath = Path.Combine(uploadsFolder, imageFileName);

                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/reports/{imageFileName}";
            }

            if (request.Audio != null && request.Audio.Length > 0)
            {
                var audioFileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Audio.FileName)}";
                var audioPath = Path.Combine(uploadsFolder, audioFileName);

                using (var stream = new FileStream(audioPath, FileMode.Create))
                {
                    await request.Audio.CopyToAsync(stream);
                }

                audioUrl = $"/uploads/reports/{audioFileName}";
            }

            var report = new Report
            {
                CitizenUserID = request.CitizenUserID,
                SectorID = request.SectorID, // القطاع الأساسي
                ReportType = request.ReportType,
                Title = request.Title,
                Description = request.Description,
                AddressText = request.AddressText,
                City = request.City,
                Latitude = request.Latitude ?? 0, // إضافة null check بسيط
                Longitude = request.Longitude ?? 0,
                CurrentStatusID = newStatus.StatusID,
                PriorityID = finalPriorityId, // القيمة الديناميكية الجديدة
                SubmittedAt = DateTime.UtcNow,
                AIConfidence = request.AIConfidence,
                AIModel = request.AIModel,
                AIExtractedText = request.AIExtractedText,
                AISummary = request.AISummary,
                ImageUrl = imageUrl,
                AudioUrl = audioUrl
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            // --- التعديل هون: تخزين مصفوفة القطاعات المتعددة القادمة من الـ AI ---
            if (request.SectorIds != null && request.SectorIds.Any())
            {
                foreach (var sId in request.SectorIds)
                {
                    _context.ReportSectors.Add(new ReportSector
                    {
                        ReportID = report.ReportID,
                        SectorID = sId
                    });
                }
                await _context.SaveChangesAsync();
            }
            // ------------------------------------------------------------------

            return Ok(new
            {
                message = "Report created successfully",
                reportId = report.ReportID
            });
        }

        [HttpGet("public")]
        public async Task<IActionResult> GetPublicReports()
        {
            var reports = await _context.Reports
                .Include(r => r.ReportSectors)
                .ThenInclude(rs => rs.Sector).Include(r => r.CurrentStatus)
                .Include(r => r.Priority)
                .OrderByDescending(r => r.SubmittedAt)
                .Select(r => new
                {
                    reportId = r.ReportID,
                    title = r.Title,
                    description = r.Description,
                    addressText = r.AddressText,
                    city = r.City,
                    latitude = r.Latitude,
                    longitude = r.Longitude,
                    reportType = r.ReportType,
                    submittedAt = r.SubmittedAt,
                    imageUrl = r.ImageUrl,
                    audioUrl = r.AudioUrl,
                    //sectorId = r.SectorID,
                    sectors = r.ReportSectors.Select(rs => new
                    {
                        rs.SectorID,
                        name = rs.Sector.SectorName
                    }),                
                    statusId = r.CurrentStatusID,
                    statusCode = r.CurrentStatus != null ? r.CurrentStatus.StatusCode : null,
                    statusName = r.CurrentStatus != null ? r.CurrentStatus.StatusName : null,
                    priorityId = r.PriorityID,
                    priorityCode = r.Priority != null ? r.Priority.PriorityCode : null,
                    priorityName = r.Priority != null ? r.Priority.PriorityName : null,
                    citizenUserId = r.CitizenUserID,
                    citizenName = r.CitizenUser != null ? r.CitizenUser.FullName : null
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyReports([FromQuery] int userId)
        {
            var reports = await _context.Reports
                .Where(r => r.CitizenUserID == userId)
                .Include(r => r.ReportSectors)
                .ThenInclude(rs => rs.Sector)
                .Include(r => r.CurrentStatus)
                .Include(r => r.Priority)
                .OrderByDescending(r => r.SubmittedAt)
                .Select(r => new
                {
                    reportId = r.ReportID,
                    title = r.Title,
                    description = r.Description,
                    addressText = r.AddressText,
                    city = r.City,
                    latitude = r.Latitude,
                    longitude = r.Longitude,
                    reportType = r.ReportType,
                    submittedAt = r.SubmittedAt,
                    imageUrl = r.ImageUrl,
                    audioUrl = r.AudioUrl,

                    sectors = r.ReportSectors.Select(rs => new
                    {
                        id = rs.SectorID,
                        name = rs.Sector.SectorName
                    }).ToList(),

                    statusName = r.CurrentStatus != null ? r.CurrentStatus.StatusName : null,
                    priorityName = r.Priority != null ? r.Priority.PriorityName : null
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("sector")]
        public async Task<IActionResult> GetSectorReports([FromQuery] int sectorId)
        {
            var reports = await _context.Reports
                .Include(r => r.ReportSectors) // 🔥 مهم
                .Where(r => r.ReportSectors.Any(rs => rs.SectorID == sectorId))
                .Include(r => r.CitizenUser)
                .Include(r => r.CurrentStatus)
                .Include(r => r.Priority)
                .OrderByDescending(r => r.SubmittedAt)
                .Select(r => new
                {
                    reportId = r.ReportID,
                    title = r.Title,
                    description = r.Description,
                    city = r.City,
                    addressText = r.AddressText,
                    latitude = r.Latitude,
                    longitude = r.Longitude,
                    reportType = r.ReportType,
                    submittedAt = r.SubmittedAt,
                    imageUrl = r.ImageUrl,
                    audioUrl = r.AudioUrl,
                    citizenUserId = r.CitizenUserID,
                    citizenName = r.CitizenUser != null ? r.CitizenUser.FullName : null,
                    statusName = r.CurrentStatus != null ? r.CurrentStatus.StatusName : null,
                    priorityName = r.Priority != null ? r.Priority.PriorityName : null
                })
                .ToListAsync();

            return Ok(reports); // 🔥 شيلنا NotFound
        }
        [HttpGet("count")]
        public async Task<IActionResult> GetReportsCount([FromQuery] int userId)
        {
            try
            {
                // بنعد السجلات في جدول الـ Reports اللي عندها نفس الـ UserId
                var count = await _context.Reports.CountAsync(r => r.CitizenUserID == userId);
                return Ok(new { count = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);

            if (report == null)
                return NotFound();

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

            await _context.SaveChangesAsync(); // Commit child deletions first

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم حذف البلاغ" });
        }

        // في ReportsController.cs

        // 1. بدلاً من [FromBody] ReportRequest، استخدم [FromForm] مع IFormFile
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReport(int id, [FromForm] ReportRequest request, IFormFile? image, IFormFile? audio)
        {
            // جلب البلاغ مع الجهات المربوطة فيه حالياً
            var report = await _context.Reports
                .Include(r => r.ReportSectors)
                .FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null) return NotFound();

            // 1. تحديث البيانات النصية والموقع والعنوان
            if (!string.IsNullOrEmpty(request.Title)) report.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Description)) report.Description = request.Description;
            if (!string.IsNullOrEmpty(request.AddressText)) report.AddressText = request.AddressText;
            if (request.Latitude.HasValue) report.Latitude = (decimal)request.Latitude.Value;
            if (request.Longitude.HasValue) report.Longitude = (decimal)request.Longitude.Value;

            // 2. تحديث المرفقات (الصورة أو الصوت)
            var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "reports");
            Directory.CreateDirectory(uploadsFolder);

            if (image != null && image.Length > 0)
            {
                var imageFileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var imagePath = Path.Combine(uploadsFolder, imageFileName);
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }
                report.ImageUrl = $"/uploads/reports/{imageFileName}";
                report.ReportType = "Image"; // تحديث نوع البلاغ إذا أصبحت صورة
            }

            if (audio != null && audio.Length > 0)
            {
                var audioFileName = $"{Guid.NewGuid()}{Path.GetExtension(audio.FileName)}";
                var audioPath = Path.Combine(uploadsFolder, audioFileName);
                using (var stream = new FileStream(audioPath, FileMode.Create))
                {
                    await audio.CopyToAsync(stream);
                }
                report.AudioUrl = $"/uploads/reports/{audioFileName}";
                // لا نغير نوع البلاغ إلى صوت إذا كان يحتوي على صورة مسبقاً (الأولوية للصورة)
                if (report.ReportType != "Image") report.ReportType = "Audio";
            }

            // 3. تحديث الجهات المسؤولة (إن وجد تحليل جديد)
            if (request.SectorIds != null && request.SectorIds.Any())
            {
                // مسح الجهات القديمة
                _context.ReportSectors.RemoveRange(report.ReportSectors);

                // إضافة الجهات الجديدة
                foreach (var sId in request.SectorIds)
                {
                    _context.ReportSectors.Add(new ReportSector { ReportID = report.ReportID, SectorID = sId });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم التحديث بنجاح", reportId = report.ReportID });
        }




        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateReportStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound("Report not found");

            var changedByUser = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == request.ChangedByUserID);

            if (changedByUser == null)
                return BadRequest("ChangedBy user not found");

            var newStatus = await _context.ReportStatuses
                .FirstOrDefaultAsync(s => s.StatusCode == request.StatusCode);

            if (newStatus == null)
                return BadRequest("Invalid status");

            var oldStatusId = report.CurrentStatusID;
            report.CurrentStatusID = newStatus.StatusID;

            if (request.StatusCode == "Processing")
                report.ReviewedAt = DateTime.UtcNow;

            if (request.StatusCode == "Resolved" || request.StatusCode == "Rejected")
                report.ClosedAt = DateTime.UtcNow;

            var history = new ReportStatusHistory
            {
                ReportID = report.ReportID,
                OldStatusID = oldStatusId,
                NewStatusID = newStatus.StatusID,
                ChangedByUserID = request.ChangedByUserID,
                ChangedAt = DateTime.UtcNow,
                ChangeNote = request.ChangeNote
            };

            _context.ReportStatusHistories.Add(history);

            _context.Notifications.Add(new Notification
            {
                UserID = report.CitizenUserID,
                ReportID = report.ReportID,
                Title = "تحديث على بلاغك",
                Body = $"تم تغيير حالة البلاغ إلى {newStatus.StatusName}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Status updated successfully",
                newStatus = newStatus.StatusName
            });
        }

        [HttpPost("{id}/assign")]
        public async Task<IActionResult> AssignReport(int id, [FromBody] AssignReportRequest request)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound("Report not found");

            var assignedByUser = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == request.AssignedByUserID);

            if (assignedByUser == null)
                return BadRequest("AssignedBy user not found");

            if (request.AssignedToUserID == null && request.AssignedToTeamID == null)
                return BadRequest("You must assign to either a user or a team");

            if (request.AssignedToUserID != null && request.AssignedToTeamID != null)
                return BadRequest("Assign either to a user or a team, not both");

            if (request.AssignedToUserID != null)
            {
                var targetUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserID == request.AssignedToUserID);

                if (targetUser == null)
                    return BadRequest("AssignedTo user not found");
            }

            if (request.AssignedToTeamID != null)
            {
                var targetTeam = await _context.Teams
                    .FirstOrDefaultAsync(t => t.TeamID == request.AssignedToTeamID);

                if (targetTeam == null)
                    return BadRequest("AssignedTo team not found");
            }

            var currentAssignments = await _context.ReportAssignments
                .Where(a => a.ReportID == id && a.IsCurrent)
                .ToListAsync();

            foreach (var assignment in currentAssignments)
            {
                assignment.IsCurrent = false;
            }

            var newAssignment = new ReportAssignment
            {
                ReportID = id,
                AssignedByUserID = request.AssignedByUserID,
                AssignedToUserID = request.AssignedToUserID,
                AssignedToTeamID = request.AssignedToTeamID,
                AssignedAt = DateTime.UtcNow,
                IsCurrent = true
            };

            _context.ReportAssignments.Add(newAssignment);

            if (request.AssignedToUserID != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserID = request.AssignedToUserID.Value,
                    ReportID = id,
                    Title = "تم إسناد بلاغ إليك",
                    Body = $"تم إسناد البلاغ رقم {id} إليك",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Report assigned successfully",
                reportId = id
            });
        }

        [HttpGet("{id}/assignments")]
        public async Task<IActionResult> GetReportAssignments(int id)
        {
            var assignments = await _context.ReportAssignments
                .Where(a => a.ReportID == id)
                .Include(a => a.AssignedByUser)
                .Include(a => a.AssignedToUser)
                .Include(a => a.AssignedToTeam)
                .OrderByDescending(a => a.AssignedAt)
                .Select(a => new
                {
                    assignmentId = a.AssignmentID,
                    reportId = a.ReportID,
                    assignedBy = a.AssignedByUser != null ? a.AssignedByUser.FullName : null,
                    assignedToUser = a.AssignedToUser != null ? a.AssignedToUser.FullName : null,
                    assignedToTeam = a.AssignedToTeam != null ? a.AssignedToTeam.TeamName : null,
                    assignedAt = a.AssignedAt,
                    isCurrent = a.IsCurrent
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpPost("{id}/notes")]
        public async Task<IActionResult> AddInternalNote(int id, [FromBody] AddInternalNoteRequest request)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound("Report not found");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == request.CreatedByUserID);

            if (user == null)
                return BadRequest("User not found");

            if (string.IsNullOrWhiteSpace(request.NoteText))
                return BadRequest("Note text is required");

            var note = new InternalNote
            {
                ReportID = id,
                CreatedByUserID = request.CreatedByUserID,
                NoteText = request.NoteText,
                CreatedAt = DateTime.UtcNow
            };

            _context.InternalNotes.Add(note);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Internal note added successfully",
                noteId = note.NoteID
            });
        }

        [HttpGet("{id}/notes")]
        public async Task<IActionResult> GetInternalNotes(int id)
        {
            var notes = await _context.InternalNotes
                .Where(n => n.ReportID == id)
                .Include(n => n.CreatedByUser)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    noteId = n.NoteID,
                    reportId = n.ReportID,
                    createdByUserId = n.CreatedByUserID,
                    createdByName = n.CreatedByUser != null ? n.CreatedByUser.FullName : null,
                    noteText = n.NoteText,
                    createdAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notes);
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetReportHistory(int id)
        {
            var history = await _context.ReportStatusHistories
                .Where(h => h.ReportID == id)
                .Include(h => h.OldStatus)
                .Include(h => h.NewStatus)
                .Include(h => h.ChangedByUser)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new
                {
                    historyId = h.HistoryID,
                    reportId = h.ReportID,
                    oldStatus = h.OldStatus != null ? h.OldStatus.StatusName : null,
                    newStatus = h.NewStatus != null ? h.NewStatus.StatusName : null,
                    changedByUserId = h.ChangedByUserID,
                    changedByName = h.ChangedByUser != null ? h.ChangedByUser.FullName : null,
                    changedAt = h.ChangedAt,
                    changeNote = h.ChangeNote
                })
                .ToListAsync();

            return Ok(history);
        }

        [HttpGet("sector/summary")]
        public async Task<IActionResult> GetSectorSummary([FromQuery] int sectorId)
        {
            var total = await _context.Reports.CountAsync(r => r.SectorID == sectorId);

            var newCount = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "New");

            var processing = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "Processing");

            var resolved = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "Resolved");

            var rejected = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "Rejected");

            return Ok(new
            {
                totalReports = total,
                newReports = newCount,
                processingReports = processing,
                resolvedReports = resolved,
                rejectedReports = rejected
            });
        }

        [HttpGet("sector/status-distribution")]
        public async Task<IActionResult> GetStatusDistribution([FromQuery] int sectorId)
        {
            var data = await _context.Reports
                .Where(r => r.SectorID == sectorId)
                .Include(r => r.CurrentStatus)
                .GroupBy(r => new
                {
                    r.CurrentStatus.StatusCode,
                    r.CurrentStatus.StatusName
                })
                .Select(g => new
                {
                    statusCode = g.Key.StatusCode,
                    statusName = g.Key.StatusName,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("sector/cities")]
        public async Task<IActionResult> GetReportsByCity([FromQuery] int sectorId)
        {
            var data = await _context.Reports
                .Where(r => r.SectorID == sectorId && !string.IsNullOrEmpty(r.City))
                .GroupBy(r => r.City)
                .Select(g => new
                {
                    city = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(x => x.count)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("sector/hotspots")]
        public async Task<IActionResult> GetHotspots([FromQuery] int sectorId)
        {
            var data = await _context.Reports
                .Where(r => r.SectorID == sectorId && !string.IsNullOrEmpty(r.AddressText))
                .GroupBy(r => r.AddressText)
                .Select(g => new
                {
                    location = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(x => x.count)
                .Take(5)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("sector/types")]
        public async Task<IActionResult> GetReportsByType([FromQuery] int sectorId)
        {
            var data = await _context.Reports
                .Where(r => r.SectorID == sectorId)
                .GroupBy(r => r.ReportType)
                .Select(g => new
                {
                    reportType = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(x => x.count)
                .ToListAsync();

            return Ok(data);
        }
        
        [HttpGet("sector/performance")]
        public async Task<IActionResult> GetSectorPerformance([FromQuery] int sectorId)
        {
            var total = await _context.Reports.CountAsync(r => r.SectorID == sectorId);

            var resolved = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "Resolved");

            var rejected = await _context.Reports
                .Include(r => r.CurrentStatus)
                .CountAsync(r => r.SectorID == sectorId && r.CurrentStatus.StatusCode == "Rejected");

            double solvedRate = total > 0 ? (double)resolved / total * 100 : 0;
            double rejectedRate = total > 0 ? (double)rejected / total * 100 : 0;

            return Ok(new
            {
                totalReports = total,
                resolvedReports = resolved,
                rejectedReports = rejected,
                solvedRate = Math.Round(solvedRate, 2),
                rejectedRate = Math.Round(rejectedRate, 2)
            });
        }

        [HttpGet("sector/{sectorId}/citizens")]
        public async Task<IActionResult> GetSectorCitizens(int sectorId)
        {
            var citizens = await _context.Users
                .Where(u => _context.Reports.Any(r => r.CitizenUserID == u.UserID && r.ReportSectors.Any(rs => rs.SectorID == sectorId)))
                .Select(u => new
                {
                    userId = u.UserID,
                    fullName = u.FullName,
                    email = u.Email,
                    totalReports = _context.Reports.Count(r => r.CitizenUserID == u.UserID && r.ReportSectors.Any(rs => rs.SectorID == sectorId)),
                    lastReportDate = _context.Reports.Where(r => r.CitizenUserID == u.UserID && r.ReportSectors.Any(rs => rs.SectorID == sectorId)).Max(r => r.SubmittedAt)
                })
                .OrderByDescending(c => c.lastReportDate)
                .ToListAsync();

            return Ok(citizens);
        }

        [HttpGet("sector/{sectorId}/citizen/{citizenId}")]
        public async Task<IActionResult> GetReportsByCitizenForSector(int sectorId, int citizenId)
        {
            var reports = await _context.Reports
                .Where(r => r.CitizenUserID == citizenId && r.ReportSectors.Any(rs => rs.SectorID == sectorId))
                .Include(r => r.CurrentStatus)
                .Include(r => r.Priority)
                .OrderByDescending(r => r.SubmittedAt)
                .Select(r => new
                {
                    reportId = r.ReportID,
                    title = r.Title,
                    description = r.Description,
                    city = r.City,
                    addressText = r.AddressText,
                    submittedAt = r.SubmittedAt,
                    statusName = r.CurrentStatus != null ? r.CurrentStatus.StatusName : null,
                    priorityName = r.Priority != null ? r.Priority.PriorityName : null
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPut("{id}/reassign")]
        public async Task<IActionResult> ReassignReport(int id, [FromBody] ReassignRequest request)
        {
            var report = await _context.Reports
                .Include(r => r.ReportSectors)
                .FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound(new { success = false, message = "البلاغ غير موجود." });

            if (request.NewSectorIds == null || !request.NewSectorIds.Any())
                return BadRequest(new { success = false, message = "يجب تحديد جهة واحدة على الأقل للتحويل." });

            // 1. تحديث القطاع الأساسي (الأولوية للبلديات لو وجدت)
            report.SectorID = request.NewSectorIds.FirstOrDefault(sid => sid >= 5) == 0 
                              ? request.NewSectorIds.First() 
                              : request.NewSectorIds.FirstOrDefault(sid => sid >= 5);

            // 2. تحديث القطاعات المرتبطة
            _context.ReportSectors.RemoveRange(report.ReportSectors);
            foreach (var sId in request.NewSectorIds)
            {
                _context.ReportSectors.Add(new ReportSector { ReportID = id, SectorID = sId });
                
                // إشعار الموظفين في الجهة الجديدة
                var newUsers = await _context.Users.Where(u => u.UserType == "Sector" && u.SectorID == sId).ToListAsync();
                foreach (var user in newUsers)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserID = user.UserID,
                        ReportID = id,
                        Title = "تم تحويل بلاغ إليك",
                        Body = $"تم تحويل البلاغ '{report.Title}' إلى قطاعك.",
                        IsRead = false,
                        CreatedAt = DateTime.Now
                    });
                }
            }

            // 3. إضافة ملاحظة لتوثيق التحويل
            if (request.UserId > 0)
            {
                var reasonText = !string.IsNullOrWhiteSpace(request.Reason) ? request.Reason : "بدون توضيح";
                _context.InternalNotes.Add(new InternalNote
                {
                    ReportID = id,
                    CreatedByUserID = request.UserId,
                    NoteText = $"تم إعادة توجيه (تحويل) البلاغ لجهات أخرى. السبب: {reasonText}",
                    CreatedAt = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "تم تحويل البلاغ بنجاح." });
        }

    }

    public class ReassignRequest
    {
        public List<int> NewSectorIds { get; set; } = new List<int>();
        public string? Reason { get; set; }
        public int UserId { get; set; }
    }

   public class CreateReportRequest
    {
        public int CitizenUserID { get; set; }
        public int? SectorID { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AddressText { get; set; }
        public string? City { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public decimal? AIConfidence { get; set; }
        public string? AIModel { get; set; }
        public string? AIExtractedText { get; set; }
        public string? AISummary { get; set; }
        public List<int>? SectorIds { get; set; } // ضيفي هاد
        public int? PriorityID { get; set; }
        public IFormFile? Image { get; set; }
        public IFormFile? Audio { get; set; }
    }
  

}
