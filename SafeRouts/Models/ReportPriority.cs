using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class ReportPriority
    {
        [Key]
        public int PriorityID { get; set; }

        public string PriorityCode { get; set; } = string.Empty;
        public string PriorityName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}