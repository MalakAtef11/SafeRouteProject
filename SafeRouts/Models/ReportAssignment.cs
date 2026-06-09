using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class ReportAssignment
    {
        [Key]
        public int AssignmentID { get; set; }

        public int ReportID { get; set; }
        public int AssignedByUserID { get; set; }
        public int? AssignedToUserID { get; set; }
        public int? AssignedToTeamID { get; set; }
        public DateTime AssignedAt { get; set; }
        public bool IsCurrent { get; set; }

        public Report? Report { get; set; }
        public User? AssignedByUser { get; set; }
        public User? AssignedToUser { get; set; }
        public Team? AssignedToTeam { get; set; }
    }
}