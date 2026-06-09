using Microsoft.EntityFrameworkCore;
using SafeRoutes.Models;

namespace SafeRoutes.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Sector> Sectors { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportStatus> ReportStatuses { get; set; }
        public DbSet<ReportPriority> ReportPriorities { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<ReportAssignment> ReportAssignments { get; set; }
        public DbSet<InternalNote> InternalNotes { get; set; }
        public DbSet<ReportStatusHistory> ReportStatusHistories { get; set; }
        public DbSet<ReportSector> ReportSectors { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }


    }


}

