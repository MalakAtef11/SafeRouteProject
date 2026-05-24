using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class Sector
    {
        [Key]
        public int SectorID { get; set; }

        public string SectorName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<ReportSector>? ReportSectors { get; set; }
    }
}