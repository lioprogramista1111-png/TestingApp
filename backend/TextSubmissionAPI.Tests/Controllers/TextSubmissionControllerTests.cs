using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TextSubmissionAPI.Controllers;
using TextSubmissionAPI.Data;
using TextSubmissionAPI.Models;
using Xunit;

namespace TextSubmissionAPI.Tests.Controllers
{
    /// <summary>
    /// Unit tests for TextSubmissionController
    /// 
    /// This test suite validates the TextSubmissionController functionality including:
    /// - CRUD operations (Create, Read, Update, Delete)
    /// - HTTP status code responses
    /// - Error handling scenarios
    /// - Data validation and business logic
    /// - Database interaction patterns
    /// - Logging behavior
    /// 
    /// Testing Strategy:
    /// - Uses in-memory database for fast, isolated tests
    /// - Mocks external dependencies (logger)
    /// - Tests both success and failure scenarios
    /// - Verifies proper HTTP responses and status codes
    /// </summary>
    public class TextSubmissionControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<TextSubmissionController>> _mockLogger;
        private readonly TextSubmissionController _controller;

        /// <summary>
        /// Test Setup Configuration
        /// 
        /// This constructor runs before each test and sets up:
        /// 1. In-memory database for isolated testing
        /// 2. Mock logger to verify logging behavior
        /// 3. Controller instance with dependencies
        /// 
        /// Why we use in-memory database:
        /// - Fast test execution (no I/O operations)
        /// - Isolated tests (each test gets fresh database)
        /// - No external dependencies or setup required
        /// - Real Entity Framework behavior without persistence
        /// </summary>
        public TextSubmissionControllerTests()
        {
            // Create in-memory database with unique name for each test instance
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<TextSubmissionController>>();
            _controller = new TextSubmissionController(_context, _mockLogger.Object);
        }

        // ========================================
        // GET OPERATIONS TESTS
        // ========================================

        /// <summary>
        /// Test: GET /api/TextSubmission
        /// Verifies that GetTextSubmissions returns all submissions in descending order by CreatedAt
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_ReturnsAllSubmissions_OrderedByCreatedAtDescending()
        {
            // Arrange: Add test data to in-memory database
            var submission1 = new TextSubmission 
            { 
                Text = "First submission", 
                CreatedAt = DateTime.UtcNow.AddMinutes(-10) 
            };
            var submission2 = new TextSubmission 
            { 
                Text = "Second submission", 
                CreatedAt = DateTime.UtcNow.AddMinutes(-5) 
            };
            var submission3 = new TextSubmission 
            { 
                Text = "Third submission", 
                CreatedAt = DateTime.UtcNow 
            };

            _context.TextSubmissions.AddRange(submission1, submission2, submission3);
            await _context.SaveChangesAsync();

            // Act: Call the controller method
            var result = await _controller.GetTextSubmissions();

            // Assert: Verify the response
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var submissions = Assert.IsAssignableFrom<IEnumerable<TextSubmission>>(okResult.Value);
            var submissionList = submissions.ToList();

            Assert.Equal(3, submissionList.Count);
            Assert.Equal("Third submission", submissionList[0].Text); // Most recent first
            Assert.Equal("Second submission", submissionList[1].Text);
            Assert.Equal("First submission", submissionList[2].Text);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission (empty database)
        /// Verifies that GetTextSubmissions returns empty list when no submissions exist
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_WithEmptyDatabase_ReturnsEmptyList()
        {
            // Act: Call the controller method with empty database
            var result = await _controller.GetTextSubmissions();

            // Assert: Verify empty response
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var submissions = Assert.IsAssignableFrom<IEnumerable<TextSubmission>>(okResult.Value);
            Assert.Empty(submissions);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission/{id}
        /// Verifies that GetTextSubmission returns the correct submission when it exists
        /// </summary>
        [Fact]
        public async Task GetTextSubmission_WithValidId_ReturnsSubmission()
        {
            // Arrange: Add a test submission
            var submission = new TextSubmission 
            { 
                Text = "Test submission", 
                CreatedAt = DateTime.UtcNow 
            };
            _context.TextSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            // Act: Get the submission by ID
            var result = await _controller.GetTextSubmission(submission.Id);

            // Assert: Verify the response
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedSubmission = Assert.IsType<TextSubmission>(okResult.Value);
            Assert.Equal(submission.Id, returnedSubmission.Id);
            Assert.Equal("Test submission", returnedSubmission.Text);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission/{id} with invalid ID
        /// Verifies that GetTextSubmission returns 404 when submission doesn't exist
        /// </summary>
        [Fact]
        public async Task GetTextSubmission_WithInvalidId_ReturnsNotFound()
        {
            // Act: Try to get a non-existent submission
            var result = await _controller.GetTextSubmission(999);

            // Assert: Verify 404 response
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = notFoundResult.Value;
            Assert.NotNull(response);
        }

        // ========================================
        // POST OPERATIONS TESTS
        // ========================================

        /// <summary>
        /// Test: POST /api/TextSubmission
        /// Verifies that PostTextSubmission creates a new submission successfully
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithValidData_CreatesSubmission()
        {
            // Arrange: Create a valid request
            var request = new TextSubmissionRequest { Text = "New test submission" };

            // Act: Create the submission
            var result = await _controller.PostTextSubmission(request);

            // Assert: Verify the response
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdSubmission = Assert.IsType<TextSubmission>(createdResult.Value);

            Assert.Equal("New test submission", createdSubmission.Text);
            Assert.True(createdSubmission.Id > 0);
            Assert.True(createdSubmission.CreatedAt <= DateTime.UtcNow);

            // Verify it was actually saved to database
            var savedSubmission = await _context.TextSubmissions.FindAsync(createdSubmission.Id);
            Assert.NotNull(savedSubmission);
            Assert.Equal("New test submission", savedSubmission.Text);
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with invalid model state
        /// Verifies that PostTextSubmission returns BadRequest for invalid data
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithInvalidModelState_ReturnsBadRequest()
        {
            // Arrange: Create invalid request and simulate model state error
            var request = new TextSubmissionRequest { Text = "" };
            _controller.ModelState.AddModelError("Text", "Text is required");

            // Act: Attempt to create submission with invalid data
            var result = await _controller.PostTextSubmission(request);

            // Assert: Verify BadRequest response
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with whitespace preservation
        /// Verifies that text with whitespace is preserved as-is (no trimming)
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_PreservesWhitespace_AsProvided()
        {
            // Arrange: Create request with leading/trailing whitespace
            var request = new TextSubmissionRequest { Text = "  Text with whitespace  " };

            // Act: Create the submission
            var result = await _controller.PostTextSubmission(request);

            // Assert: Verify whitespace was preserved (not trimmed)
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdSubmission = Assert.IsType<TextSubmission>(createdResult.Value);
            Assert.Equal("  Text with whitespace  ", createdSubmission.Text);
        }

        // ========================================
        // PUT OPERATIONS TESTS
        // ========================================

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id}
        /// Verifies that PutTextSubmission updates an existing submission
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithValidData_UpdatesSubmission()
        {
            // Arrange: Create and save a submission
            var submission = new TextSubmission
            {
                Text = "Original text",
                CreatedAt = DateTime.UtcNow
            };
            _context.TextSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            var updateRequest = new TextSubmissionRequest { Text = "Updated text" };

            // Act: Update the submission
            var result = await _controller.PutTextSubmission(submission.Id, updateRequest);

            // Assert: Verify the response
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var updatedSubmission = Assert.IsType<TextSubmission>(okResult.Value);

            Assert.Equal("Updated text", updatedSubmission.Text);
            Assert.Equal(submission.Id, updatedSubmission.Id);

            // Verify it was actually updated in database
            var savedSubmission = await _context.TextSubmissions.FindAsync(submission.Id);
            Assert.Equal("Updated text", savedSubmission.Text);
        }

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id} with invalid ID
        /// Verifies that PutTextSubmission returns 404 for non-existent submission
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithInvalidId_ReturnsNotFound()
        {
            // Arrange: Create update request for non-existent submission
            var updateRequest = new TextSubmissionRequest { Text = "Updated text" };

            // Act: Try to update non-existent submission
            var result = await _controller.PutTextSubmission(999, updateRequest);

            // Assert: Verify 404 response
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id} with invalid model state
        /// Verifies that PutTextSubmission returns BadRequest for invalid data
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithInvalidModelState_ReturnsBadRequest()
        {
            // Arrange: Create submission and invalid update request
            var submission = new TextSubmission
            {
                Text = "Original text",
                CreatedAt = DateTime.UtcNow
            };
            _context.TextSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            var updateRequest = new TextSubmissionRequest { Text = "" };
            _controller.ModelState.AddModelError("Text", "Text is required");

            // Act: Attempt to update with invalid data
            var result = await _controller.PutTextSubmission(submission.Id, updateRequest);

            // Assert: Verify BadRequest response
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        // ========================================
        // DELETE OPERATIONS TESTS
        // ========================================

        /// <summary>
        /// Test: DELETE /api/TextSubmission/{id}
        /// Verifies that DeleteTextSubmission removes the submission
        /// </summary>
        [Fact]
        public async Task DeleteTextSubmission_WithValidId_DeletesSubmission()
        {
            // Arrange: Create and save a submission
            var submission = new TextSubmission
            {
                Text = "To be deleted",
                CreatedAt = DateTime.UtcNow
            };
            _context.TextSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            // Act: Delete the submission
            var result = await _controller.DeleteTextSubmission(submission.Id);

            // Assert: Verify the response
            Assert.IsType<NoContentResult>(result);

            // Verify it was actually deleted from database
            var deletedSubmission = await _context.TextSubmissions.FindAsync(submission.Id);
            Assert.Null(deletedSubmission);
        }

        /// <summary>
        /// Test: DELETE /api/TextSubmission/{id} with invalid ID
        /// Verifies that DeleteTextSubmission returns 404 for non-existent submission
        /// </summary>
        [Fact]
        public async Task DeleteTextSubmission_WithInvalidId_ReturnsNotFound()
        {
            // Act: Try to delete a non-existent submission
            var result = await _controller.DeleteTextSubmission(999);

            // Assert: Verify 404 response
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.NotNull(notFoundResult.Value);
        }

        // ========================================
        // ERROR HANDLING TESTS
        // ========================================

        /// <summary>
        /// Test: Database exception handling in GetTextSubmissions
        /// Verifies that database errors are handled gracefully
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_WithDatabaseError_ReturnsInternalServerError()
        {
            // Arrange: Dispose context to simulate database error
            _context.Dispose();

            // Act: Attempt to get submissions with disposed context
            var result = await _controller.GetTextSubmissions();

            // Assert: Verify 500 response
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);

            // Verify error logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => true),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        /// <summary>
        /// Test: Logging behavior for successful operations
        /// Verifies that successful operations are properly logged
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithValidData_LogsSuccess()
        {
            // Arrange: Create valid request
            var request = new TextSubmissionRequest { Text = "Test submission for logging" };

            // Act: Create submission
            var result = await _controller.PostTextSubmission(request);

            // Assert: Verify success logging
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var submission = Assert.IsType<TextSubmission>(createdResult.Value);

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Text submission created with id {submission.Id}")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        /// <summary>
        /// Test: CreatedAt timestamp validation
        /// Verifies that CreatedAt is set to current UTC time
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_SetsCreatedAtToUtcNow()
        {
            // Arrange: Record time before submission
            var beforeSubmission = DateTime.UtcNow;
            var request = new TextSubmissionRequest { Text = "Time test submission" };

            // Act: Create submission
            var result = await _controller.PostTextSubmission(request);

            // Assert: Verify CreatedAt is within reasonable range
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var submission = Assert.IsType<TextSubmission>(createdResult.Value);
            var afterSubmission = DateTime.UtcNow;

            Assert.True(submission.CreatedAt >= beforeSubmission);
            Assert.True(submission.CreatedAt <= afterSubmission);
            Assert.Equal(DateTimeKind.Utc, submission.CreatedAt.Kind);
        }

        /// <summary>
        /// Test: Multiple submissions ordering
        /// Verifies that multiple submissions are correctly ordered by CreatedAt descending
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_WithMultipleSubmissions_OrdersCorrectly()
        {
            // Arrange: Create submissions with specific timestamps
            var baseTime = DateTime.UtcNow;
            var submissions = new[]
            {
                new TextSubmission { Text = "First", CreatedAt = baseTime.AddMinutes(-30) },
                new TextSubmission { Text = "Second", CreatedAt = baseTime.AddMinutes(-20) },
                new TextSubmission { Text = "Third", CreatedAt = baseTime.AddMinutes(-10) },
                new TextSubmission { Text = "Fourth", CreatedAt = baseTime }
            };

            _context.TextSubmissions.AddRange(submissions);
            await _context.SaveChangesAsync();

            // Act: Get all submissions
            var result = await _controller.GetTextSubmissions();

            // Assert: Verify correct ordering (newest first)
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedSubmissions = Assert.IsAssignableFrom<IEnumerable<TextSubmission>>(okResult.Value);
            var submissionList = returnedSubmissions.ToList();

            Assert.Equal(4, submissionList.Count);
            Assert.Equal("Fourth", submissionList[0].Text);  // Most recent
            Assert.Equal("Third", submissionList[1].Text);
            Assert.Equal("Second", submissionList[2].Text);
            Assert.Equal("First", submissionList[3].Text);   // Oldest
        }

        /// <summary>
        /// Clean up resources after each test
        /// </summary>
        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
