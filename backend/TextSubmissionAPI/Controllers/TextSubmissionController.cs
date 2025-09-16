using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TextSubmissionAPI.Data;
using TextSubmissionAPI.Models;

namespace TextSubmissionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TextSubmissionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TextSubmissionController> _logger;

        public TextSubmissionController(ApplicationDbContext context, ILogger<TextSubmissionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/TextSubmission
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TextSubmission>>> GetTextSubmissions()
        {
            try
            {
                var submissions = await _context.TextSubmissions
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync();
                
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving text submissions");
                return StatusCode(500, new { message = "An error occurred while retrieving submissions" });
            }
        }

        // GET: api/TextSubmission/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TextSubmission>> GetTextSubmission(int id)
        {
            try
            {
                var textSubmission = await _context.TextSubmissions.FindAsync(id);

                if (textSubmission == null)
                {
                    return NotFound(new { message = "Text submission not found" });
                }

                return Ok(textSubmission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving text submission with id {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the submission" });
            }
        }

        // POST: api/TextSubmission
        [HttpPost]
        public async Task<ActionResult<TextSubmission>> PostTextSubmission(TextSubmissionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var textSubmission = new TextSubmission
                {
                    Text = request.Text,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TextSubmissions.Add(textSubmission);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Text submission created with id {Id}", textSubmission.Id);

                return CreatedAtAction(nameof(GetTextSubmission), 
                    new { id = textSubmission.Id }, 
                    textSubmission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating text submission");
                return StatusCode(500, new { message = "An error occurred while saving the submission" });
            }
        }
    }

    public class TextSubmissionRequest
    {
        [Required]
        [StringLength(1000, ErrorMessage = "Text cannot exceed 1000 characters")]
        public string Text { get; set; } = string.Empty;
    }
}
