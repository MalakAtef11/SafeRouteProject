using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeRoutes.Data;
using SafeRoutes.Models;

namespace SafeRoutes.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public NotificationsController(AppDbContext db)
        {
            _db = db;
        }

        // 🔔 جلب إشعارات المستخدم
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            var data = await _db.Notifications
                .Where(n => n.UserID == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.NotificationID,
                    n.Title,
                    n.Body,
                    n.IsRead,
                    n.CreatedAt,
                    n.ReportID
                })
                .ToListAsync();

            return Ok(data);
        }

        // 🔴 عدد الإشعارات غير المقروءة (للجرس)
        [HttpGet("unread-count/{userId}")]
        public async Task<IActionResult> GetUnreadCount(int userId)
        {
            var count = await _db.Notifications
                .CountAsync(n => n.UserID == userId && !n.IsRead);

            return Ok(new { count });
        }

        // ✅ تعليم إشعار كمقروء
        [HttpPut("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var n = await _db.Notifications.FindAsync(id);
            if (n == null) return NotFound();

            n.IsRead = true;
            await _db.SaveChangesAsync();

            return Ok(new { message = "تمت القراءة" });
        }

        // ✅ تعليم الكل كمقروء
        [HttpPut("read-all/{userId}")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var notifications = await _db.Notifications
                .Where(n => n.UserID == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم تعليم الكل كمقروء" });
        }

        // ❌ حذف إشعار
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var n = await _db.Notifications.FindAsync(id);
            if (n == null) return NotFound();

            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم الحذف" });
        }

        // 🔥 إنشاء إشعار (هاي أهم وحدة)
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] Notification n)
        { 
            n.CreatedAt = DateTime.Now;
            n.IsRead = false;

            _db.Notifications.Add(n);
            await _db.SaveChangesAsync();

            return Ok(n);
        }
    }
}