using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class Notification
    {
        [Key]

        public int NotificationID { get; set; }

        public int UserID { get; set; }
        public int ReportID { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public User? User { get; set; }
        public Report? Report { get; set; }
    }
}