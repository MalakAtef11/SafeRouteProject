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

        // ===== Email Verification =====
        public bool? IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }

        // ===== Password Reset =====
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        public Sector? Sector { get; set; }
    }
}