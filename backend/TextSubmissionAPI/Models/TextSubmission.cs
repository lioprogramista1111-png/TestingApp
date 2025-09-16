using System.ComponentModel.DataAnnotations;

namespace TextSubmissionAPI.Models
{
    public class TextSubmission
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(1000, ErrorMessage = "Text cannot exceed 1000 characters")]
        public string Text { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
