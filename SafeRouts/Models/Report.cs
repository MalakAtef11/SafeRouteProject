namespace SafeRoutes.Models
{
    public class Report
    {
        public int ReportID { get; set; }
        public int CitizenUserID { get; set; }
        public int? SectorID { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AddressText { get; set; }
        public string? City { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int CurrentStatusID { get; set; }
        public int PriorityID { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public decimal? AIConfidence { get; set; }
        public string? AIModel { get; set; }
        public string? AIExtractedText { get; set; }
        public string? AISummary { get; set; }
        
        public string? ImageUrl { get; set; }
        public string? AudioUrl { get; set; }

        public User? CitizenUser { get; set; }
        public Sector? Sector { get; set; }
        public ReportStatus? CurrentStatus { get; set; }
        public ReportPriority? Priority { get; set; }
        public ICollection<ReportSector>? ReportSectors { get; set; }
    }
}