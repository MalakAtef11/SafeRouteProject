using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class Team
    {
        [Key]
        public int TeamID { get; set; }

        public int SectorID { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public Sector? Sector { get; set; }
    }
}