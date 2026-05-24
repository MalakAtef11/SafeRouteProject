using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafeRoutes.Models
{
    [Table("ReportStatusHistory")]
    public class ReportStatusHistory
    {
        [Key]
        public int HistoryID { get; set; }

        public int ReportID { get; set; }
        public int? OldStatusID { get; set; }
        public int NewStatusID { get; set; }
        public int ChangedByUserID { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? ChangeNote { get; set; }

        public Report? Report { get; set; }
        public ReportStatus? OldStatus { get; set; }
        public ReportStatus? NewStatus { get; set; }
        public User? ChangedByUser { get; set; }
    }
}