using System.ComponentModel.DataAnnotations;

namespace SafeRoutes.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string UserType { get; set; } = string.Empty;
        public int? SectorID { get; set; }
        public string AuthProvider { get; set; } = "Local";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public string? Role { get; set; }

        public Sector? Sector { get; set; }
    }
}