using System.ComponentModel.DataAnnotations;
using TextSubmissionAPI.Controllers;
using Xunit;

namespace TextSubmissionAPI.Tests.Models
{
    /// <summary>
    /// Unit tests for TextSubmissionRequest model
    /// 
    /// This test suite validates the TextSubmissionRequest model including:
    /// - Data annotation validation attributes
    /// - Required field validation
    /// - String length validation
    /// - Model binding behavior
    /// - Validation error messages
    /// 
    /// Testing Strategy:
    /// - Uses ValidationContext to test data annotations
    /// - Tests both valid and invalid scenarios
    /// - Verifies proper error messages
    /// - Tests boundary conditions
    /// </summary>
    public class TextSubmissionRequestTests
    {
        /// <summary>
        /// Helper method to validate a model using data annotations
        /// </summary>
        /// <param name="model">The model to validate</param>
        /// <returns>List of validation results</returns>
        private static IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, validationContext, validationResults, true);
            return validationResults;
        }

        // ========================================
        // VALID INPUT TESTS
        // ========================================

        /// <summary>
        /// Test: Valid text input
        /// Verifies that valid text passes all validation rules
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithValidText_PassesValidation()
        {
            // Arrange: Create request with valid text
            var request = new TextSubmissionRequest
            {
                Text = "This is a valid text submission"
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Test: Text at maximum length boundary
        /// Verifies that text at exactly 1000 characters passes validation
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithMaxLengthText_PassesValidation()
        {
            // Arrange: Create request with exactly 1000 characters
            var maxLengthText = new string('A', 1000);
            var request = new TextSubmissionRequest
            {
                Text = maxLengthText
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Test: Text with special characters
        /// Verifies that text with special characters, numbers, and symbols passes validation
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithSpecialCharacters_PassesValidation()
        {
            // Arrange: Create request with special characters
            var request = new TextSubmissionRequest
            {
                Text = "Text with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>? and numbers 123456789"
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Test: Text with Unicode characters
        /// Verifies that text with Unicode characters passes validation
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithUnicodeCharacters_PassesValidation()
        {
            // Arrange: Create request with Unicode characters
            var request = new TextSubmissionRequest
            {
                Text = "Text with Unicode: 你好世界 🌍 café naïve résumé"
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        // ========================================
        // INVALID INPUT TESTS
        // ========================================

        /// <summary>
        /// Test: Required field validation
        /// Verifies that empty or null text fails validation
        /// </summary>
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void TextSubmissionRequest_WithEmptyOrNullText_FailsValidation(string invalidText)
        {
            // Arrange: Create request with invalid text
            var request = new TextSubmissionRequest
            {
                Text = invalidText
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Should have validation error
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("Text"));
        }

        /// <summary>
        /// Test: Maximum length validation
        /// Verifies that text exceeding 1000 characters fails validation
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithTooLongText_FailsValidation()
        {
            // Arrange: Create request with text exceeding 1000 characters
            var tooLongText = new string('A', 1001);
            var request = new TextSubmissionRequest
            {
                Text = tooLongText
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Should have validation error
            Assert.NotEmpty(validationResults);
            var lengthError = validationResults.FirstOrDefault(vr => 
                vr.MemberNames.Contains("Text") && 
                vr.ErrorMessage.Contains("1000 characters"));
            Assert.NotNull(lengthError);
        }

        /// <summary>
        /// Test: Whitespace-only text validation
        /// Verifies that whitespace-only text fails required validation
        /// </summary>
        [Theory]
        [InlineData(" ")]
        [InlineData("   ")]
        [InlineData("\t")]
        [InlineData("\n")]
        [InlineData("\r\n")]
        public void TextSubmissionRequest_WithWhitespaceOnlyText_FailsValidation(string whitespaceText)
        {
            // Arrange: Create request with whitespace-only text
            var request = new TextSubmissionRequest
            {
                Text = whitespaceText
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Should have validation error (Required attribute doesn't allow whitespace-only)
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("Text"));
        }

        // ========================================
        // BOUNDARY CONDITION TESTS
        // ========================================

        /// <summary>
        /// Test: Single character text
        /// Verifies that single character text passes validation
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_WithSingleCharacter_PassesValidation()
        {
            // Arrange: Create request with single character
            var request = new TextSubmissionRequest
            {
                Text = "A"
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Test: Text at boundary lengths
        /// Verifies validation behavior at various text lengths
        /// </summary>
        [Theory]
        [InlineData(1)]      // Minimum valid length
        [InlineData(50)]     // Common short text
        [InlineData(500)]    // Medium length text
        [InlineData(999)]    // Just under maximum
        [InlineData(1000)]   // Exactly at maximum
        public void TextSubmissionRequest_WithVariousValidLengths_PassesValidation(int length)
        {
            // Arrange: Create request with specified length
            var text = new string('A', length);
            var request = new TextSubmissionRequest
            {
                Text = text
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: No validation errors
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Test: Text exceeding maximum by various amounts
        /// Verifies that any text over 1000 characters fails validation
        /// </summary>
        [Theory]
        [InlineData(1001)]   // Just over maximum
        [InlineData(1100)]   // Moderately over
        [InlineData(2000)]   // Significantly over
        [InlineData(5000)]   // Way over maximum
        public void TextSubmissionRequest_WithVariousInvalidLengths_FailsValidation(int length)
        {
            // Arrange: Create request with specified length
            var text = new string('A', length);
            var request = new TextSubmissionRequest
            {
                Text = text
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Should have validation error
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, vr => 
                vr.MemberNames.Contains("Text") && 
                vr.ErrorMessage.Contains("1000 characters"));
        }

        // ========================================
        // ERROR MESSAGE TESTS
        // ========================================

        /// <summary>
        /// Test: Validation error message content
        /// Verifies that validation error messages contain expected text
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_ValidationErrors_ContainExpectedMessages()
        {
            // Arrange: Create request with text that's too long
            var tooLongText = new string('A', 1001);
            var request = new TextSubmissionRequest
            {
                Text = tooLongText
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Check error message content
            var lengthError = validationResults.FirstOrDefault(vr => 
                vr.MemberNames.Contains("Text"));
            
            Assert.NotNull(lengthError);
            Assert.Contains("1000 characters", lengthError.ErrorMessage);
        }

        /// <summary>
        /// Test: Property name in validation results
        /// Verifies that validation errors correctly identify the Text property
        /// </summary>
        [Fact]
        public void TextSubmissionRequest_ValidationErrors_IdentifyCorrectProperty()
        {
            // Arrange: Create request with invalid text
            var request = new TextSubmissionRequest
            {
                Text = ""
            };

            // Act: Validate the model
            var validationResults = ValidateModel(request);

            // Assert: Check that error is associated with Text property
            Assert.NotEmpty(validationResults);
            Assert.All(validationResults, vr => 
                Assert.Contains("Text", vr.MemberNames));
        }
    }
}
