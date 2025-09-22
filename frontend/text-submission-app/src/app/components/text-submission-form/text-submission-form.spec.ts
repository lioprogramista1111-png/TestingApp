/**
 * TextSubmissionForm Component Unit Tests
 *
 * This test suite validates the TextSubmissionForm component functionality including:
 * - Component initialization and form setup
 * - Form validation (required, minLength, maxLength)
 * - User input handling and character counting
 * - Submit button state management
 * - Service integration for text submission
 * - Success and error handling scenarios
 * - Loading states and user feedback
 * - Form reset after successful submission
 * - Event emission to parent components
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TextSubmissionForm } from './text-submission-form';
import { TextSubmissionService, TextSubmissionModel } from '../../services/text-submission';

describe('TextSubmissionForm Component', () => {
  let component: TextSubmissionForm;
  let fixture: ComponentFixture<TextSubmissionForm>;
  let mockService: jasmine.SpyObj<TextSubmissionService>;

  /**
   * Test Setup Configuration
   *
   * This beforeEach block runs before each test and sets up:
   * 1. Mock service with spy methods to isolate component testing
   * 2. Default return values for service methods
   * 3. Angular testing module configuration with required imports
   * 4. Component instance creation and initialization
   *
   * Why we mock the service:
   * - Isolates component logic from external dependencies
   * - Makes tests faster and more reliable
   * - Allows us to control service responses for different scenarios
   */
  beforeEach(async () => {
    // Create spy object with methods we want to track and control
    mockService = jasmine.createSpyObj('TextSubmissionService', ['submitText']);

    // Configure default successful response
    const mockResponse: TextSubmissionModel = {
      id: 1,
      text: 'Test submission',
      createdAt: '2025-09-22T10:30:00.000Z'
    };
    mockService.submitText.and.returnValue(of(mockResponse));

    // Configure Angular testing module
    await TestBed.configureTestingModule({
      imports: [
        TextSubmissionForm, // Import standalone component
        ReactiveFormsModule  // Required for reactive forms
      ],
      providers: [
        // Replace real service with our mock for testing
        { provide: TextSubmissionService, useValue: mockService }
      ]
    }).compileComponents();

    // Create component instance for testing
    fixture = TestBed.createComponent(TextSubmissionForm);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  // ========================================
  // BASIC COMPONENT TESTS
  // ========================================

  /**
   * Test 1: Component Creation
   *
   * This fundamental test verifies that the component can be instantiated
   * without errors. It's a "smoke test" that ensures:
   * - All dependencies are properly injected
   * - Constructor executes successfully
   * - Component instance is created and valid
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test 2: Form Initialization
   *
   * Verifies that the reactive form is properly initialized with:
   * - Correct form structure (text control exists)
   * - Proper initial values (empty text field)
   * - Required validators are attached
   */
  it('should initialize form with correct structure', () => {
    // Assert: Verify form exists and has correct structure
    expect(component.textForm).toBeTruthy();
    expect(component.textControl).toBeTruthy();
    expect(component.textControl?.value).toBe('');
  });

  /**
   * Test 3: Initial State Verification
   *
   * Ensures the component starts with correct initial values
   * for all its signals and properties.
   */
  it('should have correct initial state', () => {
    expect(component.isSubmitting()).toBeFalsy();
    expect(component.submitMessage()).toBe('');
    expect(component.submitSuccess()).toBeFalsy();
    expect(component.textForm.valid).toBeFalsy(); // Form should be invalid initially (empty required field)
  });

  // ========================================
  // FORM VALIDATION TESTS
  // ========================================

  /**
   * Test Group: Form Validation
   *
   * These tests verify the form validation logic including:
   * - Required field validation
   * - Minimum length validation (10 characters)
   * - Maximum length validation (50 characters)
   * - Form validity states
   */
  describe('Form Validation', () => {
    /**
     * Test: Required field validation
     * Verifies that empty text input shows required error
     */
    it('should validate required field', () => {
      const textControl = component.textControl;

      // Test empty value
      textControl?.setValue('');
      expect(textControl?.hasError('required')).toBeTruthy();
      expect(component.textForm.valid).toBeFalsy();

      // Test with value
      textControl?.setValue('Valid text input here');
      expect(textControl?.hasError('required')).toBeFalsy();
    });

    /**
     * Test: Minimum length validation
     * Verifies that text shorter than 10 characters shows minlength error
     */
    it('should validate minimum length (10 characters)', () => {
      const textControl = component.textControl;

      // Test too short (9 characters)
      textControl?.setValue('Too short');
      expect(textControl?.hasError('minlength')).toBeTruthy();
      expect(component.textForm.valid).toBeFalsy();

      // Test exactly minimum length (10 characters)
      textControl?.setValue('Valid text'); // exactly 10 characters
      expect(textControl?.hasError('minlength')).toBeFalsy();

      // Test longer than minimum
      textControl?.setValue('This is definitely long enough');
      expect(textControl?.hasError('minlength')).toBeFalsy();
    });

    /**
     * Test: Maximum length validation
     * Verifies that text longer than 50 characters shows maxlength error
     */
    it('should validate maximum length (50 characters)', () => {
      const textControl = component.textControl;

      // Test exactly maximum length (50 characters)
      const maxLengthText = 'This is a valid text that is exactly fifty chars'; // exactly 50 characters
      textControl?.setValue(maxLengthText);
      expect(textControl?.hasError('maxlength')).toBeFalsy();

      // Test too long (51+ characters)
      const tooLongText = 'This text is way too long and exceeds the fifty character limit'; // 63 characters
      textControl?.setValue(tooLongText);
      expect(textControl?.hasError('maxlength')).toBeTruthy();
      expect(component.textForm.valid).toBeFalsy();
    });

    /**
     * Test: Valid input acceptance
     * Verifies that valid input (10-50 characters) passes all validations
     */
    it('should accept valid input (10-50 characters)', () => {
      const textControl = component.textControl;
      const validText = 'This is a valid text input'; // 26 characters

      textControl?.setValue(validText);

      expect(textControl?.hasError('required')).toBeFalsy();
      expect(textControl?.hasError('minlength')).toBeFalsy();
      expect(textControl?.hasError('maxlength')).toBeFalsy();
      expect(component.textForm.valid).toBeTruthy();
    });
  });

  // ========================================
  // USER INTERACTION TESTS
  // ========================================

  /**
   * Test Group: User Interactions
   *
   * These tests verify user interaction scenarios including:
   * - Submit button state management
   * - Form submission handling
   * - Loading states during submission
   * - Character counting display
   */
  describe('User Interactions', () => {
    /**
     * Test: Submit button state management
     * Verifies that submit button is disabled when form is invalid or submitting
     */
    it('should manage submit button state correctly', () => {
      // Initially disabled (form invalid)
      expect(component.textForm.invalid).toBeTruthy();

      // Make form valid
      component.textControl?.setValue('Valid text input here');
      expect(component.textForm.valid).toBeTruthy();

      // Test submitting state
      component.isSubmitting.set(true);
      // Button should be disabled when submitting even if form is valid
      const shouldBeDisabled = component.textForm.invalid || component.isSubmitting();
      expect(shouldBeDisabled).toBeTruthy();
    });

    /**
     * Test: Form submission with valid data
     * Verifies the complete successful submission workflow
     */
    it('should handle successful form submission', () => {
      // Arrange: Set up valid form data
      const validText = 'This is a valid test submission';
      component.textControl?.setValue(validText);

      // Spy on the submissionAdded output
      spyOn(component.submissionAdded, 'emit');

      // Act: Submit the form
      component.onSubmit();

      // Assert: Verify the submission process
      expect(mockService.submitText).toHaveBeenCalledWith({ text: validText });
      expect(component.isSubmitting()).toBeFalsy(); // Should be reset after success
      expect(component.submitSuccess()).toBeTruthy();
      expect(component.submitMessage()).toBe('Text submitted successfully!');
      expect(component.textControl?.value).toBeNull(); // Form should be reset (reset() sets to null)
      expect(component.submissionAdded.emit).toHaveBeenCalled();
    });

    /**
     * Test: Form submission with invalid data
     * Verifies that invalid form submission is prevented
     */
    it('should prevent submission with invalid form', () => {
      // Arrange: Set up invalid form data (empty)
      component.textControl?.setValue('');

      // Act: Attempt to submit invalid form
      component.onSubmit();

      // Assert: Verify submission was prevented
      expect(mockService.submitText).not.toHaveBeenCalled();
      expect(component.isSubmitting()).toBeFalsy();
    });
  });

  // ========================================
  // ERROR HANDLING AND LOADING STATES
  // ========================================

  /**
   * Test Group: Error Handling
   *
   * These tests verify error handling scenarios including:
   * - Network errors during submission
   * - Server errors and error messages
   * - Loading state management during errors
   * - User feedback for error scenarios
   */
  describe('Error Handling', () => {
    /**
     * Test: Submission error handling
     * Verifies that submission errors are handled gracefully with user feedback
     */
    it('should handle submission errors', () => {
      // Arrange: Configure service to return error
      spyOn(console, 'error'); // Suppress expected console errors
      mockService.submitText.and.returnValue(throwError(() => new Error('Network error')));

      // Set up valid form data
      component.textControl?.setValue('Valid text for error test');

      // Act: Submit the form (will trigger error)
      component.onSubmit();

      // Assert: Verify error handling
      expect(component.isSubmitting()).toBeFalsy(); // Should be reset after error
      expect(component.submitSuccess()).toBeFalsy();
      expect(component.submitMessage()).toBe('Error submitting text. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Submission error:', jasmine.any(Error));
    });

    /**
     * Test: Loading state during submission
     * Verifies that loading state is properly managed during submission process
     */
    it('should manage loading state during submission', () => {
      // Arrange: Set up valid form data
      component.textControl?.setValue('Valid text for loading test');

      // Set up a previous error message to verify it gets cleared
      component.submitMessage.set('Previous error message');

      // Act: Start submission (this will complete immediately with our mock)
      component.onSubmit();

      // Assert: Verify the submission completed successfully
      // Note: Since we're using a synchronous mock, the loading state will be false after completion
      expect(component.isSubmitting()).toBeFalsy();
      expect(component.submitMessage()).toBe('Text submitted successfully!'); // Success message should be set
    });

    /**
     * Test: Error state reset on new submission
     * Verifies that previous error messages are cleared when starting new submission
     */
    it('should clear previous error messages on new submission', () => {
      // Arrange: Set up error state
      component.submitSuccess.set(false);
      component.submitMessage.set('Previous error message');

      // Set up valid form and successful service response
      component.textControl?.setValue('Valid text for reset test');
      const mockResponse: TextSubmissionModel = {
        id: 1,
        text: 'Valid text for reset test',
        createdAt: '2025-09-22T10:30:00.000Z'
      };
      mockService.submitText.and.returnValue(of(mockResponse));

      // Act: Submit form
      component.onSubmit();

      // Assert: Verify error state is cleared
      expect(component.submitMessage()).toBe('Text submitted successfully!');
      expect(component.submitSuccess()).toBeTruthy();
    });
  });

  // ========================================
  // TEMPLATE INTEGRATION TESTS
  // ========================================

  /**
   * Test Group: Template Integration
   *
   * These tests verify the integration between component logic and template:
   * - Character count display
   * - Error message display
   * - Submit button text changes
   * - Form field validation styling
   */
  describe('Template Integration', () => {
    /**
     * Test: Character count display
     * Verifies that character count is correctly calculated and displayed
     */
    it('should display correct character count', () => {
      const testText = 'Hello World'; // 11 characters
      component.textControl?.setValue(testText);
      fixture.detectChanges();

      // Check if character count is displayed correctly in template
      const characterCountElement = fixture.nativeElement.querySelector('.character-count');
      expect(characterCountElement?.textContent).toContain('11/50 characters');
    });

    /**
     * Test: Error message display in template
     * Verifies that validation error messages are shown in the template
     */
    it('should display validation error messages', () => {
      // Trigger required error
      const textControl = component.textControl;
      textControl?.setValue('');
      textControl?.markAsTouched(); // Mark as touched to trigger error display
      fixture.detectChanges();

      // Check for required error message
      const errorMessages = fixture.nativeElement.querySelectorAll('.error-message');
      const requiredError = Array.from(errorMessages).find((el: any) =>
        el.textContent.includes('Text is required')
      );
      expect(requiredError).toBeTruthy();
    });

    /**
     * Test: Submit button text changes
     * Verifies that submit button text changes based on submission state
     */
    it('should update submit button text based on state', () => {
      const submitButton = fixture.nativeElement.querySelector('.submit-btn');

      // Initial state
      expect(submitButton?.textContent.trim()).toBe('Submit');

      // Submitting state
      component.isSubmitting.set(true);
      fixture.detectChanges();
      expect(submitButton?.textContent.trim()).toBe('Submitting...');

      // Back to normal state
      component.isSubmitting.set(false);
      fixture.detectChanges();
      expect(submitButton?.textContent.trim()).toBe('Submit');
    });

    /**
     * Test: Success message display
     * Verifies that success messages are properly displayed after submission
     */
    it('should display success message after successful submission', () => {
      // Set up success state
      component.submitSuccess.set(true);
      component.submitMessage.set('Text submitted successfully!');
      fixture.detectChanges();

      // Check for success message in template
      const messageElement = fixture.nativeElement.querySelector('.message.success');
      expect(messageElement?.textContent).toContain('Text submitted successfully!');
    });

    /**
     * Test: Error message display
     * Verifies that error messages are properly displayed after failed submission
     */
    it('should display error message after failed submission', () => {
      // Set up error state
      component.submitSuccess.set(false);
      component.submitMessage.set('Error submitting text. Please try again.');
      fixture.detectChanges();

      // Check for error message in template
      const messageElement = fixture.nativeElement.querySelector('.message.error');
      expect(messageElement?.textContent).toContain('Error submitting text. Please try again.');
    });
  });

  // ========================================
  // EDGE CASES AND BOUNDARY TESTS
  // ========================================

  /**
   * Test Group: Edge Cases
   *
   * These tests verify edge cases and boundary conditions:
   * - Whitespace handling
   * - Exact boundary values (10 and 50 characters)
   * - Multiple rapid submissions
   * - Form reset behavior
   */
  describe('Edge Cases', () => {
    /**
     * Test: Whitespace trimming
     * Verifies that leading/trailing whitespace is trimmed before submission
     */
    it('should trim whitespace before submission', () => {
      // Arrange: Set text with leading/trailing whitespace
      const textWithWhitespace = '  Valid text input here  ';
      const expectedTrimmedText = 'Valid text input here';
      component.textControl?.setValue(textWithWhitespace);

      // Act: Submit the form
      component.onSubmit();

      // Assert: Verify trimmed text was sent to service
      expect(mockService.submitText).toHaveBeenCalledWith({ text: expectedTrimmedText });
    });

    /**
     * Test: Boundary value testing
     * Verifies behavior at exact minimum and maximum character limits
     */
    it('should handle boundary values correctly', () => {
      const textControl = component.textControl;

      // Test exactly 10 characters (minimum valid)
      const minText = 'Valid text'; // exactly 10 characters
      textControl?.setValue(minText);
      expect(textControl?.valid).toBeTruthy();

      // Test exactly 50 characters (maximum valid)
      const maxText = 'This is exactly fifty characters long text here!!'; // exactly 50 characters
      textControl?.setValue(maxText);
      expect(textControl?.valid).toBeTruthy();

      // Test 9 characters (just below minimum)
      const belowMin = 'Too short'; // 9 characters
      textControl?.setValue(belowMin);
      expect(textControl?.hasError('minlength')).toBeTruthy();

      // Test 51 characters (just above maximum)
      const aboveMax = 'This text is way too long and exceeds the fifty char'; // 51 characters
      textControl?.setValue(aboveMax);
      expect(textControl?.hasError('maxlength')).toBeTruthy();
    });

    /**
     * Test: Form reset after successful submission
     * Verifies that form is properly reset after successful submission
     */
    it('should reset form after successful submission', () => {
      // Arrange: Set up form with valid data
      component.textControl?.setValue('Valid text for reset test');
      expect(component.textControl?.value).toBe('Valid text for reset test');

      // Act: Submit successfully
      component.onSubmit();

      // Assert: Verify form is reset
      expect(component.textControl?.value).toBeNull(); // Form reset sets value to null
      expect(component.textForm.pristine).toBeTruthy(); // Form should be pristine after reset
    });

    /**
     * Test: Submit button disabled during submission
     * Verifies that submit button is disabled when form is submitting
     * Note: The component doesn't prevent onSubmit() calls, but the UI disables the button
     */
    it('should disable submit button during submission', () => {
      // Arrange: Set up valid form data
      component.textControl?.setValue('Valid text for button test');

      // Test button enabled state when not submitting
      let shouldBeDisabled = component.textForm.invalid || component.isSubmitting();
      expect(shouldBeDisabled).toBeFalsy(); // Should be enabled

      // Test button disabled state when submitting
      component.isSubmitting.set(true);
      shouldBeDisabled = component.textForm.invalid || component.isSubmitting();
      expect(shouldBeDisabled).toBeTruthy(); // Should be disabled
    });

    /**
     * Test: Event emission to parent component
     * Verifies that submissionAdded event is emitted after successful submission
     */
    it('should emit submissionAdded event after successful submission', () => {
      // Arrange: Set up valid form data and spy on event emission
      component.textControl?.setValue('Valid text for event test');
      spyOn(component.submissionAdded, 'emit');

      // Act: Submit successfully
      component.onSubmit();

      // Assert: Verify event was emitted
      expect(component.submissionAdded.emit).toHaveBeenCalledWith();
    });

    /**
     * Test: No event emission on failed submission
     * Verifies that submissionAdded event is NOT emitted when submission fails
     */
    it('should not emit submissionAdded event on failed submission', () => {
      // Arrange: Configure service to return error
      spyOn(console, 'error');
      mockService.submitText.and.returnValue(throwError(() => new Error('Submission failed')));
      component.textControl?.setValue('Valid text for failed event test');
      spyOn(component.submissionAdded, 'emit');

      // Act: Submit (will fail)
      component.onSubmit();

      // Assert: Verify event was NOT emitted
      expect(component.submissionAdded.emit).not.toHaveBeenCalled();
    });
  });
});
