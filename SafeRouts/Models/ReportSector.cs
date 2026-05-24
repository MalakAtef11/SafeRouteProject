using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafeRoutes.Models
{
    public class ReportSector
    {
        [Key]
        public int Id { get; set; }

        public int ReportID { get; set; }
        public int SectorID { get; set; }

        public Report? Report { get; set; }
        public Sector? Sector { get; set; }
    }
}