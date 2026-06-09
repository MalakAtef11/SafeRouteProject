using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class ReportStatus
    {
        [Key]
        public int StatusID { get; set; }

        public string StatusCode { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}