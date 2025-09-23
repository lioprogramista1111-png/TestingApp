using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using TextSubmissionAPI.Controllers;
using TextSubmissionAPI.Data;
using TextSubmissionAPI.Models;
using Xunit;

namespace TextSubmissionAPI.Tests.Integration
{
    /// <summary>
    /// Integration tests for TextSubmissionAPI
    /// 
    /// These tests verify the complete HTTP pipeline including:
    /// - HTTP routing and endpoints
    /// - Request/response serialization
    /// - Model binding and validation
    /// - Database operations through Entity Framework
    /// - CORS configuration
    /// - Error handling and status codes
    /// - End-to-end API workflows
    /// 
    /// Testing Strategy:
    /// - Uses WebApplicationFactory for in-memory test server
    /// - Real HTTP requests through HttpClient
    /// - In-memory database for isolation
    /// - Tests complete request/response cycle
    /// - Verifies actual JSON serialization/deserialization
    /// </summary>
    public class TextSubmissionIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        /// <summary>
        /// Integration Test Setup
        /// 
        /// This constructor sets up:
        /// 1. WebApplicationFactory for hosting the API in-memory
        /// 2. HttpClient for making real HTTP requests
        /// 3. In-memory database configuration for test isolation
        /// 
        /// Benefits of Integration Testing:
        /// - Tests real HTTP requests/responses
        /// - Validates routing and middleware pipeline
        /// - Ensures JSON serialization works correctly
        /// - Catches issues that unit tests might miss
        /// </summary>
        public TextSubmissionIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");

                builder.ConfigureServices(services =>
                {
                    // Remove all existing DbContext registrations
                    var descriptorsToRemove = services.Where(d =>
                        d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                        d.ServiceType == typeof(ApplicationDbContext) ||
                        d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
                        .ToList();

                    foreach (var descriptor in descriptorsToRemove)
                    {
                        services.Remove(descriptor);
                    }

                    // Add in-memory database for testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase($"IntegrationTestDb_{Guid.NewGuid()}");
                        options.EnableSensitiveDataLogging();
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        // ========================================
        // GET ENDPOINT INTEGRATION TESTS
        // ========================================

        /// <summary>
        /// Test: GET /api/TextSubmission
        /// Verifies complete GET workflow including HTTP status, headers, and JSON response
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_ReturnsOkWithJsonArray()
        {
            // Arrange: Seed test data through POST requests
            var submission1 = new TextSubmissionRequest { Text = "First integration test" };
            var submission2 = new TextSubmissionRequest { Text = "Second integration test" };

            await _client.PostAsJsonAsync("/api/TextSubmission", submission1);
            await _client.PostAsJsonAsync("/api/TextSubmission", submission2);

            // Act: Make GET request
            var response = await _client.GetAsync("/api/TextSubmission");

            // Assert: Verify HTTP response
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType?.ToString());

            // Verify JSON content
            var submissions = await response.Content.ReadFromJsonAsync<List<TextSubmission>>();
            Assert.NotNull(submissions);
            Assert.Equal(2, submissions.Count);
            
            // Verify ordering (newest first)
            Assert.Equal("Second integration test", submissions[0].Text);
            Assert.Equal("First integration test", submissions[1].Text);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission (empty database)
        /// Verifies that empty database returns empty JSON array
        /// </summary>
        [Fact]
        public async Task GetTextSubmissions_WithEmptyDatabase_ReturnsEmptyArray()
        {
            // Act: Make GET request to empty database
            var response = await _client.GetAsync("/api/TextSubmission");

            // Assert: Verify response
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var submissions = await response.Content.ReadFromJsonAsync<List<TextSubmission>>();
            Assert.NotNull(submissions);
            Assert.Empty(submissions);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission/{id}
        /// Verifies single item retrieval with proper JSON serialization
        /// </summary>
        [Fact]
        public async Task GetTextSubmission_WithValidId_ReturnsSubmission()
        {
            // Arrange: Create a submission
            var request = new TextSubmissionRequest { Text = "Test submission for GET by ID" };
            var createResponse = await _client.PostAsJsonAsync("/api/TextSubmission", request);
            var createdSubmission = await createResponse.Content.ReadFromJsonAsync<TextSubmission>();

            // Act: Get the submission by ID
            var response = await _client.GetAsync($"/api/TextSubmission/{createdSubmission!.Id}");

            // Assert: Verify response
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var submission = await response.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.NotNull(submission);
            Assert.Equal(createdSubmission.Id, submission.Id);
            Assert.Equal("Test submission for GET by ID", submission.Text);
        }

        /// <summary>
        /// Test: GET /api/TextSubmission/{id} with invalid ID
        /// Verifies 404 response for non-existent resources
        /// </summary>
        [Fact]
        public async Task GetTextSubmission_WithInvalidId_Returns404()
        {
            // Act: Try to get non-existent submission
            var response = await _client.GetAsync("/api/TextSubmission/999");

            // Assert: Verify 404 response
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        // ========================================
        // POST ENDPOINT INTEGRATION TESTS
        // ========================================

        /// <summary>
        /// Test: POST /api/TextSubmission
        /// Verifies complete POST workflow including JSON deserialization and database persistence
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithValidData_ReturnsCreatedWithLocation()
        {
            // Arrange: Create valid request
            var request = new TextSubmissionRequest { Text = "Integration test submission" };

            // Act: Make POST request
            var response = await _client.PostAsJsonAsync("/api/TextSubmission", request);

            // Assert: Verify HTTP response
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(response.Headers.Location);

            // Verify response body
            var submission = await response.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.NotNull(submission);
            Assert.True(submission.Id > 0);
            Assert.Equal("Integration test submission", submission.Text);
            Assert.True(submission.CreatedAt <= DateTime.UtcNow);

            // Verify Location header points to correct resource
            var locationResponse = await _client.GetAsync(response.Headers.Location);
            Assert.Equal(HttpStatusCode.OK, locationResponse.StatusCode);
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with invalid data
        /// Verifies model validation through complete HTTP pipeline
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithInvalidData_ReturnsBadRequest()
        {
            // Arrange: Create invalid request (empty text)
            var request = new TextSubmissionRequest { Text = "" };

            // Act: Make POST request
            var response = await _client.PostAsJsonAsync("/api/TextSubmission", request);

            // Assert: Verify validation error response
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("Text", errorContent); // Should contain validation error for Text field
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with malformed JSON
        /// Verifies handling of JSON deserialization errors
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithMalformedJson_ReturnsBadRequest()
        {
            // Arrange: Create malformed JSON
            var malformedJson = "{ \"Text\": \"Valid text\", }"; // Trailing comma makes it invalid
            var content = new StringContent(malformedJson, Encoding.UTF8, "application/json");

            // Act: Make POST request with malformed JSON
            var response = await _client.PostAsync("/api/TextSubmission", content);

            // Assert: Verify bad request response
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with text at maximum length
        /// Verifies boundary condition handling through HTTP pipeline
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithMaxLengthText_ReturnsCreated()
        {
            // Arrange: Create request with maximum allowed text length (1000 characters)
            var maxLengthText = new string('A', 1000);
            var request = new TextSubmissionRequest { Text = maxLengthText };

            // Act: Make POST request
            var response = await _client.PostAsJsonAsync("/api/TextSubmission", request);

            // Assert: Verify successful creation
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            
            var submission = await response.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.NotNull(submission);
            Assert.Equal(1000, submission.Text.Length);
        }

        /// <summary>
        /// Test: POST /api/TextSubmission with text exceeding maximum length
        /// Verifies validation of text length limits
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithTooLongText_ReturnsBadRequest()
        {
            // Arrange: Create request with text exceeding maximum length (1001 characters)
            var tooLongText = new string('A', 1001);
            var request = new TextSubmissionRequest { Text = tooLongText };

            // Act: Make POST request
            var response = await _client.PostAsJsonAsync("/api/TextSubmission", request);

            // Assert: Verify validation error
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("1000 characters", errorContent);
        }

        // ========================================
        // PUT ENDPOINT INTEGRATION TESTS
        // ========================================

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id}
        /// Verifies complete PUT workflow including JSON deserialization and database updates
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithValidData_ReturnsOkWithUpdatedData()
        {
            // Arrange: Create a submission first
            var createRequest = new TextSubmissionRequest { Text = "Original text for update test" };
            var createResponse = await _client.PostAsJsonAsync("/api/TextSubmission", createRequest);
            var createdSubmission = await createResponse.Content.ReadFromJsonAsync<TextSubmission>();

            var updateRequest = new TextSubmissionRequest { Text = "Updated text via integration test" };

            // Act: Update the submission
            var response = await _client.PutAsJsonAsync($"/api/TextSubmission/{createdSubmission!.Id}", updateRequest);

            // Assert: Verify HTTP response
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            // Verify response body
            var updatedSubmission = await response.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.NotNull(updatedSubmission);
            Assert.Equal(createdSubmission.Id, updatedSubmission.Id);
            Assert.Equal("Updated text via integration test", updatedSubmission.Text);

            // Verify the update persisted by fetching the resource again
            var getResponse = await _client.GetAsync($"/api/TextSubmission/{createdSubmission.Id}");
            var fetchedSubmission = await getResponse.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.Equal("Updated text via integration test", fetchedSubmission!.Text);
        }

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id} with invalid ID
        /// Verifies 404 response for updates to non-existent resources
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithInvalidId_Returns404()
        {
            // Arrange: Create update request for non-existent submission
            var updateRequest = new TextSubmissionRequest { Text = "Update for non-existent submission" };

            // Act: Try to update non-existent submission
            var response = await _client.PutAsJsonAsync("/api/TextSubmission/999", updateRequest);

            // Assert: Verify 404 response
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test: PUT /api/TextSubmission/{id} with invalid data
        /// Verifies validation during update operations
        /// </summary>
        [Fact]
        public async Task PutTextSubmission_WithInvalidData_ReturnsBadRequest()
        {
            // Arrange: Create a submission first
            var createRequest = new TextSubmissionRequest { Text = "Original text for validation test" };
            var createResponse = await _client.PostAsJsonAsync("/api/TextSubmission", createRequest);
            var createdSubmission = await createResponse.Content.ReadFromJsonAsync<TextSubmission>();

            var invalidUpdateRequest = new TextSubmissionRequest { Text = "" }; // Empty text is invalid

            // Act: Try to update with invalid data
            var response = await _client.PutAsJsonAsync($"/api/TextSubmission/{createdSubmission!.Id}", invalidUpdateRequest);

            // Assert: Verify validation error
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("Text", errorContent);
        }

        // ========================================
        // DELETE ENDPOINT INTEGRATION TESTS
        // ========================================

        /// <summary>
        /// Test: DELETE /api/TextSubmission/{id}
        /// Verifies complete DELETE workflow and resource removal
        /// </summary>
        [Fact]
        public async Task DeleteTextSubmission_WithValidId_ReturnsNoContentAndRemovesResource()
        {
            // Arrange: Create a submission first
            var createRequest = new TextSubmissionRequest { Text = "Text to be deleted" };
            var createResponse = await _client.PostAsJsonAsync("/api/TextSubmission", createRequest);
            var createdSubmission = await createResponse.Content.ReadFromJsonAsync<TextSubmission>();

            // Act: Delete the submission
            var response = await _client.DeleteAsync($"/api/TextSubmission/{createdSubmission!.Id}");

            // Assert: Verify HTTP response
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            Assert.Equal(0, response.Content.Headers.ContentLength); // No content body

            // Verify the resource was actually deleted
            var getResponse = await _client.GetAsync($"/api/TextSubmission/{createdSubmission.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        /// <summary>
        /// Test: DELETE /api/TextSubmission/{id} with invalid ID
        /// Verifies 404 response for deletion of non-existent resources
        /// </summary>
        [Fact]
        public async Task DeleteTextSubmission_WithInvalidId_Returns404()
        {
            // Act: Try to delete non-existent submission
            var response = await _client.DeleteAsync("/api/TextSubmission/999");

            // Assert: Verify 404 response
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        // ========================================
        // END-TO-END WORKFLOW TESTS
        // ========================================

        /// <summary>
        /// Test: Complete CRUD workflow
        /// Verifies full Create -> Read -> Update -> Delete cycle
        /// </summary>
        [Fact]
        public async Task CompleteWorkflow_CreateReadUpdateDelete_WorksCorrectly()
        {
            // Step 1: CREATE
            var createRequest = new TextSubmissionRequest { Text = "Workflow test submission" };
            var createResponse = await _client.PostAsJsonAsync("/api/TextSubmission", createRequest);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var createdSubmission = await createResponse.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.NotNull(createdSubmission);
            var submissionId = createdSubmission.Id;

            // Step 2: READ
            var readResponse = await _client.GetAsync($"/api/TextSubmission/{submissionId}");
            Assert.Equal(HttpStatusCode.OK, readResponse.StatusCode);

            var readSubmission = await readResponse.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.Equal("Workflow test submission", readSubmission!.Text);

            // Step 3: UPDATE
            var updateRequest = new TextSubmissionRequest { Text = "Updated workflow test submission" };
            var updateResponse = await _client.PutAsJsonAsync($"/api/TextSubmission/{submissionId}", updateRequest);
            Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

            var updatedSubmission = await updateResponse.Content.ReadFromJsonAsync<TextSubmission>();
            Assert.Equal("Updated workflow test submission", updatedSubmission!.Text);

            // Step 4: DELETE
            var deleteResponse = await _client.DeleteAsync($"/api/TextSubmission/{submissionId}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            // Step 5: VERIFY DELETION
            var verifyResponse = await _client.GetAsync($"/api/TextSubmission/{submissionId}");
            Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
        }

        /// <summary>
        /// Test: Multiple submissions ordering
        /// Verifies that multiple submissions are returned in correct order (newest first)
        /// </summary>
        [Fact]
        public async Task MultipleSubmissions_AreOrderedByCreatedAtDescending()
        {
            // Arrange: Create multiple submissions with delays to ensure different timestamps
            var requests = new[]
            {
                new TextSubmissionRequest { Text = "First submission" },
                new TextSubmissionRequest { Text = "Second submission" },
                new TextSubmissionRequest { Text = "Third submission" }
            };

            var createdSubmissions = new List<TextSubmission>();
            foreach (var request in requests)
            {
                var response = await _client.PostAsJsonAsync("/api/TextSubmission", request);
                var submission = await response.Content.ReadFromJsonAsync<TextSubmission>();
                createdSubmissions.Add(submission!);

                // Small delay to ensure different timestamps
                await Task.Delay(10);
            }

            // Act: Get all submissions
            var getResponse = await _client.GetAsync("/api/TextSubmission");
            var submissions = await getResponse.Content.ReadFromJsonAsync<List<TextSubmission>>();

            // Assert: Verify ordering (newest first)
            Assert.NotNull(submissions);
            Assert.Equal(3, submissions.Count);
            Assert.Equal("Third submission", submissions[0].Text);   // Most recent
            Assert.Equal("Second submission", submissions[1].Text);
            Assert.Equal("First submission", submissions[2].Text);   // Oldest
        }

        /// <summary>
        /// Test: Content-Type header validation
        /// Verifies that API correctly handles different content types
        /// </summary>
        [Fact]
        public async Task PostTextSubmission_WithWrongContentType_ReturnsBadRequest()
        {
            // Arrange: Create request with wrong content type
            var jsonContent = JsonSerializer.Serialize(new TextSubmissionRequest { Text = "Test content type" });
            var content = new StringContent(jsonContent, Encoding.UTF8, "text/plain"); // Wrong content type

            // Act: Make POST request with wrong content type
            var response = await _client.PostAsync("/api/TextSubmission", content);

            // Assert: Verify unsupported media type or bad request
            Assert.True(response.StatusCode == HttpStatusCode.BadRequest ||
                       response.StatusCode == HttpStatusCode.UnsupportedMediaType);
        }
    }
}
