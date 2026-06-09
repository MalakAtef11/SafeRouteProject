using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;
using System.Linq;

namespace SafeRoutes.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly OpenAIService _ai;
        private readonly AppDbContext _db;

        public AIController(OpenAIService ai, AppDbContext db)
        {
            _ai = ai;
            _db = db;
        }

        [HttpPost("submit-report")]
        public async Task<IActionResult> SubmitReport([FromForm] ReportRequest request, IFormFile? image, IFormFile? audio)
        {
            AIResult aiResult;

            try
            {
                string cityName = Request.Form["city"];
                string address = request.AddressText;
                string locationContext = $"المدينة: {cityName}, العنوان: {address}";

                // 1. تحليل الذكاء الاصطناعي بناءً على نوع المدخل
                if (image != null)
                    aiResult = await _ai.AnalyzeImage(image, locationContext);
                else if (audio != null)
                    aiResult = await _ai.AnalyzeAudio(audio, locationContext);
                else
                    aiResult = await _ai.AnalyzeText(request.Description ?? "", locationContext);

                // 2. معالجة وتصحيح جهات البلاغ
                var finalSectors = aiResult.SectorIds?
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList() ?? new List<int>();

                // 🔥 المنطق الصارم: إذا وُجدت محافظة (6-16)، احذف عمان (5) فوراً
                if (finalSectors.Any(id => id >= 6 && id <= 16))
                {
                    finalSectors.Remove(5);
                }
                
                // التعديل القوي: لو الـ AI رجع "البلدية" (1) وإحنا عارفين اسم المحافظة من الإحداثيات، استبدلها بالقوة!
                if (finalSectors.Contains(1) && !string.IsNullOrWhiteSpace(cityName))
                {
                    var mappedId = GetCitySectorId(cityName);
                    if (mappedId.HasValue)
                    {
                        finalSectors.Remove(1);
                        if (!finalSectors.Contains(mappedId.Value)) finalSectors.Add(mappedId.Value);
                    }
                }

                // --- شبكة الأمان (Safety Net) ---
                // إذا كان النص يحتوي على كلمات معينة، نفرض القطاعات بالقوة!
                string desc = request.Description ?? "";
                if (desc.Contains("حادث") || desc.Contains("تصادم"))
                {
                    if (!finalSectors.Contains(2)) finalSectors.Add(2); // إدارة السير
                }
                if (desc.Contains("اصابة") || desc.Contains("إصابة") || desc.Contains("مصاب") || desc.Contains("اسعاف") || desc.Contains("إسعاف"))
                {
                    if (!finalSectors.Contains(20)) finalSectors.Add(20); // الدفاع المدني
                }
                if (desc.Contains("حفرة") || desc.Contains("شارع") || desc.Contains("رصيف") || desc.Contains("نظافة") || desc.Contains("نفايات"))
                {
                    var mappedId = GetCitySectorId(cityName) ?? 1;
                    if (!finalSectors.Contains(mappedId)) finalSectors.Add(mappedId); // البلدية المعنية
                }
                if (desc.Contains("كهرباء") || desc.Contains("سلك") || desc.Contains("عمود"))
                {
                    if (!finalSectors.Contains(18) && !finalSectors.Contains(3)) finalSectors.Add(18);
                }
                if (desc.Contains("مياه") || desc.Contains("تسريب") || desc.Contains("ماسورة"))
                {
                    if (!finalSectors.Contains(17) && !finalSectors.Contains(4)) finalSectors.Add(17);
                }

                // تنظيف: إذا تم تحديد أي بلدية مخصصة (5-16)، احذف البلدية العامة (1)
                if (finalSectors.Any(id => id >= 5 && id <= 16))
                {
                    finalSectors.Remove(1);
                }
                else if (finalSectors.Count == 0)
                {
                    finalSectors.Add(5); // Fallback لعمان فقط إذا لم يُحدد شيء
                }

                // 3. حفظ الملفات وتجهيز البيانات
                string? imageUrl = image != null ? await SaveFile(image, "uploads/images") : null;
                string? audioUrl = audio != null ? await SaveFile(audio, "uploads/audio") : null;

                string baseTitle = aiResult.Summary ?? "بلاغ ميداني جديد";
                string finalTitle = !string.IsNullOrEmpty(cityName) ? $"{baseTitle} في {cityName}" : baseTitle;

                // 4. إنشاء سجل البلاغ (القفلة النهائية للـ SectorID)
                var newReport = new Report
                {
                    CitizenUserID = int.Parse(Request.Form["citizenUserID"]),
                    Title = finalTitle,
                    Description = (string.IsNullOrWhiteSpace(request.Description)) ? aiResult.ExtractedText : request.Description,
                    ReportType = (image != null) ? "Image" : (audio != null ? "Audio" : "Text"),
                    Latitude = (decimal)(request.Latitude ?? 0),
                    Longitude = (decimal)(request.Longitude ?? 0),
                    City = cityName,
                    ImageUrl = imageUrl,
                    AudioUrl = audioUrl,
                    CurrentStatusID = 1,

                    // ✅ الحل لخطأ السطر 77: نستخدم الشرط الثلاثي بدلاً من الـ ??
                    SectorID = finalSectors.Any(id => id >= 5 && id <= 16)
                               ? finalSectors.First(id => id >= 5 && id <= 16)
                               : finalSectors.FirstOrDefault(),

                    PriorityID = aiResult.PriorityId > 0 ? aiResult.PriorityId : 2,
                    AISummary = aiResult.Summary,
                    AIConfidence = (decimal)aiResult.Confidence,
                    AIExtractedText = aiResult.ExtractedText,
                    AIModel = "gpt-4o-mini",
                    SubmittedAt = DateTime.Now
                };

                _db.Reports.Add(newReport);
                await _db.SaveChangesAsync();

                // 5. ربط البلاغ بالجهات وإرسال الإشعارات
                foreach (var sId in finalSectors)
                {
                    // ربط في جدول ReportSectors (عشان يظهر في داشبورد الموظف)
                    _db.ReportSectors.Add(new ReportSector { ReportID = newReport.ReportID, SectorID = sId });

                    var sectorUsers = _db.Users.Where(u => u.UserType == "Sector" && u.SectorID == sId).ToList();
                    foreach (var user in sectorUsers)
                    {
                        _db.Notifications.Add(new Notification
                        {
                            UserID = user.UserID,
                            ReportID = newReport.ReportID,
                            Title = "بلاغ جديد في منطقتك",
                            Body = $"بلاغ جديد بخصوص: {newReport.Title}",
                            IsRead = false,
                            CreatedAt = DateTime.Now
                        });
                    }
                }

                await _db.SaveChangesAsync();
                return Ok(new { success = true, reportId = newReport.ReportID, sectors = finalSectors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"حدث خطأ: {ex.Message} | {ex.InnerException?.Message}");
            }
        }
        private async Task<string?> SaveFile(IFormFile? file, string folderName)
        {
            if (file == null) return null;

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName);
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(folderPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return folderName + "/" + fileName;
        }

        // ميثودات التحليل السريع (للمعاينة فقط)
        [HttpPost("analyze-text")]
        public async Task<IActionResult> AnalyzeText([FromForm] string description)
        {
            if (string.IsNullOrWhiteSpace(description)) return BadRequest("الوصف فارغ");
            return Ok(await _ai.AnalyzeText(description));
        }

        [HttpPost("analyze-image")]
        public async Task<IActionResult> AnalyzeImage(IFormFile image)
        {
            if (image == null) return BadRequest("الصورة فارغة");
            return Ok(await _ai.AnalyzeImage(image));
        }
        [HttpPost("analyze-audio")]
        public async Task<IActionResult> AnalyzeAudio(IFormFile audio)
        {
            if (audio == null) return BadRequest("الملف الصوتي مفقود");
            return Ok(await _ai.AnalyzeAudio(audio));
        }
        [HttpPut("update-report/{id}")]
     
        public async Task<IActionResult> UpdateReport(int id, [FromForm] ReportRequest request, IFormFile? image, IFormFile? audio)
        {
            try
            {
                var report = await _db.Reports
                    .Include(r => r.ReportSectors)
                    .FirstOrDefaultAsync(r => r.ReportID == id);

                if (report == null) return NotFound("البلاغ غير موجود");

                string cityName = Request.Form["city"];
                string address = request.AddressText;
                string locationContext = $"المدينة: {cityName}, العنوان: {address}";

                // 1. تحليل AI جديد بناءً على المرفقات الجديدة
                AIResult aiResult = null;
                if (image != null)
                    aiResult = await _ai.AnalyzeImage(image, locationContext);
                else if (audio != null)
                    aiResult = await _ai.AnalyzeAudio(audio, locationContext);
                else if (!string.IsNullOrWhiteSpace(request.Description))
                    aiResult = await _ai.AnalyzeText(request.Description, locationContext);

                // 2. تحديث البيانات الأساسية (من نتائج الـ AI)
                if (aiResult != null)
                {
                    // استلام اسم المدينة من الفرونت لو تغير الموقع ع الخريطة (تم استلامه مسبقاً)
                    string baseTitle = aiResult.Summary ?? "بلاغ معدل";

                    // تحديث العنوان بناءً على الموقع الجديد
                    report.Title = !string.IsNullOrEmpty(cityName) ? $"{baseTitle} في {cityName}" : baseTitle;

                    if (aiResult.PriorityId > 0) report.PriorityID = aiResult.PriorityId;

                    report.AISummary = aiResult.Summary;
                    report.AIConfidence = (decimal)aiResult.Confidence;
                    report.AIExtractedText = aiResult.ExtractedText;
                }

                // 3. تحديث الوصف والموقع
                if (aiResult != null && audio != null && !string.IsNullOrWhiteSpace(aiResult.ExtractedText))
                    report.Description = aiResult.ExtractedText;
                else if (!string.IsNullOrWhiteSpace(request.Description))
                    report.Description = request.Description;

                if (request.Latitude.HasValue && request.Latitude != 0) report.Latitude = (decimal)request.Latitude;
                if (request.Longitude.HasValue && request.Longitude != 0) report.Longitude = (decimal)request.Longitude;

                // 4. معالجة المرفقات (حفظ أو حذف)
                if (image != null && image.Length > 0)
                {
                    report.ImageUrl = await SaveFile(image, "uploads/images");
                    report.ReportType = "Image";
                }
                if (audio != null && audio.Length > 0)
                {
                    report.AudioUrl = await SaveFile(audio, "uploads/audio");
                    if (report.ReportType != "Image") report.ReportType = "Audio";
                }

                if (Request.Form["removeImage"] == "true") report.ImageUrl = null;
                if (Request.Form["removeAudio"] == "true") report.AudioUrl = null;

                    // 5. تحديث الجهات (Sectors) - هون التعديل المهم عشان "عجلون وعمان"
                if (aiResult?.SectorIds != null && aiResult.SectorIds.Any(s => s > 0))
                {
                    var finalSectors = aiResult.SectorIds.Where(s => s > 0).Distinct().ToList();

                    // 🔥 نفس المنطق: إذا في محافظة (6-16)، شيل عمان (5)
                    if (finalSectors.Any(sid => sid >= 6 && sid <= 16))
                    {
                        finalSectors.Remove(5);
                    }

                    // التعديل القوي: لو الـ AI رجع "البلدية" (1) وإحنا عارفين اسم المحافظة من الإحداثيات، استبدلها بالقوة!
                    if (finalSectors.Contains(1) && !string.IsNullOrWhiteSpace(cityName))
                    {
                        var mappedId = GetCitySectorId(cityName);
                        if (mappedId.HasValue)
                        {
                            finalSectors.Remove(1);
                            if (!finalSectors.Contains(mappedId.Value)) finalSectors.Add(mappedId.Value);
                        }
                    }

                    // --- شبكة الأمان (Safety Net) ---
                    // إذا كان النص يحتوي على كلمات معينة، نفرض القطاعات بالقوة!
                    string desc = request.Description ?? report.Description ?? "";
                    if (desc.Contains("حادث") || desc.Contains("تصادم"))
                    {
                        if (!finalSectors.Contains(2)) finalSectors.Add(2); // إدارة السير
                    }
                    if (desc.Contains("اصابة") || desc.Contains("إصابة") || desc.Contains("مصاب") || desc.Contains("اسعاف") || desc.Contains("إسعاف"))
                    {
                        if (!finalSectors.Contains(20)) finalSectors.Add(20); // الدفاع المدني
                    }
                    if (desc.Contains("حفرة") || desc.Contains("شارع") || desc.Contains("رصيف") || desc.Contains("نظافة") || desc.Contains("نفايات"))
                    {
                        var mappedId = GetCitySectorId(cityName) ?? 1;
                        if (!finalSectors.Contains(mappedId)) finalSectors.Add(mappedId); // البلدية المعنية
                    }
                    if (desc.Contains("كهرباء") || desc.Contains("سلك") || desc.Contains("عمود"))
                    {
                        if (!finalSectors.Contains(18) && !finalSectors.Contains(3)) finalSectors.Add(18);
                    }
                    if (desc.Contains("مياه") || desc.Contains("تسريب") || desc.Contains("ماسورة"))
                    {
                        if (!finalSectors.Contains(17) && !finalSectors.Contains(4)) finalSectors.Add(17);
                    }

                    // تنظيف: إذا تم تحديد أي بلدية مخصصة (5-16)، احذف البلدية العامة (1)
                    if (finalSectors.Any(sid => sid >= 5 && sid <= 16))
                    {
                        finalSectors.Remove(1);
                    }

                    // تحديث القطاع الرئيسي في جدول الـ Reports
                    report.SectorID = finalSectors.FirstOrDefault(sid => sid >= 5);

                    // تحديث جدول الربط ReportSectors
                    _db.ReportSectors.RemoveRange(report.ReportSectors);
                    foreach (var sId in finalSectors)
                    {
                        _db.ReportSectors.Add(new ReportSector { ReportID = report.ReportID, SectorID = sId });
                    }
                }

                await _db.SaveChangesAsync();
                return Ok(new { success = true, reportId = report.ReportID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"خطأ: {ex.Message}");
            }
        }
        private int? GetCitySectorId(string cityName)
        {
            if (string.IsNullOrWhiteSpace(cityName)) return null;
            var name = cityName.Trim();
            if (name.Contains("عمان") || name.Contains("Amman")) return 5;
            if (name.Contains("إربد") || name.Contains("Irbid")) return 6;
            if (name.Contains("الزرقاء") || name.Contains("Zarqa")) return 7;
            if (name.Contains("العقبة") || name.Contains("Aqaba")) return 8;
            if (name.Contains("الكرك") || name.Contains("Karak")) return 9;
            if (name.Contains("مادبا") || name.Contains("Madaba")) return 10;
            if (name.Contains("السلط") || name.Contains("Salt")) return 11;
            if (name.Contains("جرش") || name.Contains("Jerash")) return 12;
            if (name.Contains("عجلون") || name.Contains("Ajloun")) return 13;
            if (name.Contains("المفرق") || name.Contains("Mafraq")) return 14;
            if (name.Contains("الطفيلة") || name.Contains("Tafilah")) return 15;
            if (name.Contains("معان") || name.Contains("Maan")) return 16;
            return null;
        }
    }

    // الـ DTO لاستقبال البيانات
    public class ReportRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AddressText { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<int>? SectorIds { get; set; } // لاستقبال الجهات الجديدة
    }

}