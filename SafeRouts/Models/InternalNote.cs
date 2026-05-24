using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class InternalNote
    {
        [Key]
        public int NoteID { get; set; }

        public int ReportID { get; set; }
        public int CreatedByUserID { get; set; }
        public string NoteText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public Report? Report { get; set; }
        public User? CreatedByUser { get; set; }
    }
}