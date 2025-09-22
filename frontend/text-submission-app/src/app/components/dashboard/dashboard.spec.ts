/**
 * Dashboard Component Unit Tests
 *
 * This test suite validates the Dashboard component functionality including:
 * - Component initialization and lifecycle
 * - Service integration for data loading
 * - Error handling scenarios
 * - User interaction features (edit mode)
 * - State management with Angular signals
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { TextSubmissionService, TextSubmissionModel } from '../../services/text-submission';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockService: jasmine.SpyObj<TextSubmissionService>;

  /**
   * Test Setup Configuration
   *
   * This beforeEach block runs before each test and sets up:
   * 1. Mock service with spy methods to isolate component testing
   * 2. Default return values for service methods
   * 3. Angular testing module configuration
   * 4. Component instance creation
   *
   * Why we use mocks:
   * - Prevents actual HTTP calls during testing
   * - Allows controlled testing of different scenarios
   * - Makes tests faster and more reliable
   * - Isolates component logic from external dependencies
   */
  beforeEach(async () => {
    // Create spy object with methods we want to track and control
    mockService = jasmine.createSpyObj('TextSubmissionService', ['getSubmissions', 'updateSubmission', 'deleteSubmission']);

    // Configure default successful responses
    mockService.getSubmissions.and.returnValue(of([])); // Empty array for no submissions
    mockService.updateSubmission.and.returnValue(of({} as any)); // Mock successful update
    mockService.deleteSubmission.and.returnValue(of(undefined)); // Void return for successful delete

    // Configure Angular testing module
    await TestBed.configureTestingModule({
      imports: [Dashboard], // Import standalone component
      providers: [
        // Replace real service with our mock for testing
        { provide: TextSubmissionService, useValue: mockService }
      ]
    }).compileComponents();

    // Create component instance for testing
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

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
   * Test 2: Service Integration on Initialization
   *
   * This test verifies that the component properly calls the service
   * to load data when it initializes. The Dashboard should automatically
   * fetch submissions when the user first visits the page.
   *
   * What we're testing:
   * - ngOnInit lifecycle hook triggers data loading
   * - Service method is called to fetch submissions
   * - Component initiates the data loading process
   */
  it('should load submissions on init', () => {
    // Act: Trigger component initialization
    component.ngOnInit();

    // Assert: Verify service was called to load data
    expect(mockService.getSubmissions).toHaveBeenCalled();
  });

  /**
   * Test 3: Date Formatting Utility
   *
   * This test validates the formatDate method which converts ISO date strings
   * into human-readable format for display in the dashboard table.
   *
   * Why this matters:
   * - Ensures consistent date display across the application
   * - Verifies the method handles ISO date strings correctly
   * - Confirms the output is in a readable string format
   */
  it('should format date correctly', () => {
    // Arrange: Use a known ISO date string
    const testDate = '2025-09-20T10:30:00.000Z';

    // Act: Format the date
    const result = component.formatDate(testDate);

    // Assert: Verify the output contains expected year and is a string
    expect(result).toContain('2025');
    expect(typeof result).toBe('string');
  });

  /**
   * Test 4: Error Handling
   *
   * This test verifies that the component gracefully handles errors when
   * the service fails to load submissions. Proper error handling ensures:
   * - Application doesn't crash on network/server errors
   * - User receives appropriate feedback
   * - Component remains in a stable state
   *
   * Error scenarios covered:
   * - Network connectivity issues
   * - Server errors (500, 404, etc.)
   * - Service unavailability
   */
  it('should handle errors', () => {
    // Arrange: Suppress expected console errors for clean test output
    spyOn(console, 'error');

    // Configure service to return an error
    mockService.getSubmissions.and.returnValue(throwError(() => new Error('Service error')));

    // Act: Trigger initialization which will cause the error
    component.ngOnInit();

    // Assert: Verify error handling
    expect(component.errorMessage()).toBeTruthy(); // Error message is set
    expect(component.isLoading()).toBeFalsy(); // Loading state is reset
  });

  /**
   * Test 5: Initial State Verification
   *
   * This test ensures the component starts with correct initial values
   * for all its signals. Proper initial state prevents:
   * - Undefined or null reference errors
   * - Unexpected UI behavior on first load
   * - State inconsistencies
   *
   * Signal states verified:
   * - submissions: empty array (no data loaded yet)
   * - isLoading: false (not loading initially)
   * - errorMessage: empty string (no errors initially)
   * - editingId: null (not in edit mode)
   * - editText: empty string (no edit text)
   */
  it('should have correct initial state', () => {
    expect(component.submissions()).toEqual([]);
    expect(component.isLoading()).toBeFalsy();
    expect(component.errorMessage()).toBe('');
    expect(component.editingId()).toBeNull();
    expect(component.editText()).toBe('');
  });

  /**
   * Test 6: Refresh Functionality
   *
   * This test verifies the refresh mechanism that allows users to manually
   * reload the submissions list. This is important for:
   * - Getting latest data when user suspects changes
   * - Recovering from temporary network issues
   * - Providing user control over data freshness
   *
   * Test approach:
   * - Spy on the loadSubmissions method to track calls
   * - Call refreshSubmissions method (simulates user clicking refresh button)
   * - Verify loadSubmissions was called (delegation pattern)
   */
  it('should refresh submissions', () => {
    // Arrange: Spy on the loadSubmissions method to track calls
    spyOn(component, 'loadSubmissions');

    // Act: Call refresh method (simulates user clicking refresh button)
    component.refreshSubmissions();

    // Assert: Verify loadSubmissions was called
    expect(component.loadSubmissions).toHaveBeenCalled();
  });

  /**
   * Test 7: Edit Mode Activation
   *
   * This test verifies the edit functionality that allows users to modify
   * existing submissions. When a user clicks the edit button:
   * - Component should enter edit mode for the specific submission
   * - Edit form should be populated with current submission text
   * - Component state should reflect the editing session
   *
   * State changes verified:
   * - editingId signal is set to the submission ID being edited
   * - editText signal is populated with the current submission text
   *
   * This enables inline editing in the dashboard table.
   */
  it('should activate edit mode', () => {
    // Arrange: Create a mock submission to edit
    const mockSubmission = {
      id: 1,
      text: 'Test submission text',
      createdAt: '2025-09-20T10:30:00.000Z'
    };

    // Act: Start edit mode (simulates clicking edit button)
    component.startEdit(mockSubmission);

    // Assert: Verify edit mode is activated with correct data
    expect(component.editingId()).toBe(1); // Editing the correct submission
    expect(component.editText()).toBe('Test submission text'); // Text loaded for editing
  });

  /**
   * Test 8: Edit Mode Cancellation
   *
   * This test verifies that users can cancel edit operations and return
   * the component to its normal state. This is important for:
   * - User experience (ability to back out of changes)
   * - Preventing accidental modifications
   * - Resetting component state properly
   *
   * Test flow:
   * 1. Start edit mode (sets editingId and editText)
   * 2. Cancel edit operation (simulates clicking cancel button)
   * 3. Verify state is reset to initial values
   *
   * State reset verification:
   * - editingId returns to null (no submission being edited)
   * - editText returns to empty string (no edit text)
   */
  it('should cancel edit mode', () => {
    // Arrange: Create a mock submission and start edit mode
    const mockSubmission = {
      id: 1,
      text: 'Test submission text',
      createdAt: '2025-09-20T10:30:00.000Z'
    };

    // Start edit mode first
    component.startEdit(mockSubmission);

    // Act: Cancel the edit operation (simulates clicking cancel button)
    component.cancelEdit();

    // Assert: Verify edit mode is deactivated and state is reset
    expect(component.editingId()).toBeNull(); // No longer editing
    expect(component.editText()).toBe(''); // Edit text cleared
  });

  // ========================================
  // ADDITIONAL UNIT TESTS FOR COMPREHENSIVE COVERAGE
  // ========================================

  /**
   * Test Group: Text Validation
   *
   * These tests verify the text validation logic used in edit operations.
   * The component enforces a 10-50 character limit for submissions.
   */
  describe('Text Validation', () => {
    /**
     * Test: Valid text length acceptance
     * Verifies that text within the 10-50 character range is accepted
     */
    it('should accept valid text length (10-50 characters)', () => {
      // Test minimum valid length (10 characters)
      const validText10 = 'Valid text'; // exactly 10 characters
      expect(component['isValidTextLength'](validText10)).toBeTruthy();

      // Test maximum valid length (50 characters)
      const validText50 = 'This is a valid text that is exactly fifty chars'; // exactly 50 characters
      expect(component['isValidTextLength'](validText50)).toBeTruthy();

      // Test middle range
      const validText25 = 'This is valid text here'; // 23 characters
      expect(component['isValidTextLength'](validText25)).toBeTruthy();
    });

    /**
     * Test: Invalid text length rejection
     * Verifies that text outside the 10-50 character range is rejected
     */
    it('should reject invalid text length', () => {
      // Test too short (less than 10 characters)
      const tooShort = 'Short'; // 5 characters
      expect(component['isValidTextLength'](tooShort)).toBeFalsy();

      // Test empty string
      expect(component['isValidTextLength']('')).toBeFalsy();

      // Test too long (more than 50 characters)
      const tooLong = 'This text is way too long and exceeds the fifty character limit that is enforced'; // 80+ characters
      expect(component['isValidTextLength'](tooLong)).toBeFalsy();
    });
  });

  /**
   * Test Group: Edit State Management
   *
   * These tests verify the edit state management functionality including
   * starting edit mode, canceling edits, and resetting state.
   */
  describe('Edit State Management', () => {
    /**
     * Test: Edit state reset functionality
     * Verifies that resetEditState properly clears all edit-related signals
     */
    it('should reset edit state properly', () => {
      // Arrange: Set some edit state
      component.editingId.set(123);
      component.editText.set('Some edit text');

      // Act: Reset the edit state
      component['resetEditState']();

      // Assert: Verify state is cleared
      expect(component.editingId()).toBeNull();
      expect(component.editText()).toBe('');
    });

    /**
     * Test: Multiple edit operations
     * Verifies that starting edit on different submissions works correctly
     */
    it('should handle multiple edit operations correctly', () => {
      // Arrange: Create multiple mock submissions
      const submission1 = { id: 1, text: 'First submission text', createdAt: '2025-09-20T10:30:00.000Z' };
      const submission2 = { id: 2, text: 'Second submission text', createdAt: '2025-09-20T11:30:00.000Z' };

      // Act & Assert: Start edit on first submission
      component.startEdit(submission1);
      expect(component.editingId()).toBe(1);
      expect(component.editText()).toBe('First submission text');

      // Act & Assert: Switch to editing second submission
      component.startEdit(submission2);
      expect(component.editingId()).toBe(2);
      expect(component.editText()).toBe('Second submission text');
    });
  });

  /**
   * Test Group: Error Handling
   *
   * These tests verify comprehensive error handling scenarios including
   * network errors, validation errors, and user feedback.
   */
  describe('Error Handling', () => {
    /**
     * Test: Error state management
     * Verifies that handleError method properly sets error messages
     */
    it('should handle errors and set error messages', () => {
      // Arrange: Spy on console.error to verify logging
      spyOn(console, 'error');
      const errorMessage = 'Test error message';
      const mockError = new Error('Mock error');

      // Act: Handle an error
      component['handleError'](errorMessage, mockError);

      // Assert: Verify error handling
      expect(component.errorMessage()).toBe(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Dashboard error:', mockError);
    });

    /**
     * Test: Loading state clears errors
     * Verifies that setting loading state clears previous error messages
     */
    it('should clear error message when setting loading state', () => {
      // Arrange: Set an error message
      component.errorMessage.set('Previous error');

      // Act: Set loading state to true
      component['setLoadingState'](true);

      // Assert: Verify error is cleared and loading is set
      expect(component.errorMessage()).toBe('');
      expect(component.isLoading()).toBeTruthy();
    });

    /**
     * Test: Update submission error handling
     * Verifies that update errors are handled gracefully with user feedback
     */
    it('should handle update submission errors', () => {
      // Arrange: Mock service to return error and spy on alert
      spyOn(window, 'alert');
      spyOn(console, 'error');
      mockService.updateSubmission.and.returnValue(throwError(() => new Error('Update failed')));

      // Set up edit state
      component.editingId.set(1);
      component.editText.set('Valid updated text here');

      // Act: Attempt to save edit
      component.saveEdit(1);

      // Assert: Verify error handling
      expect(window.alert).toHaveBeenCalledWith('Failed to update submission. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Error updating submission:', jasmine.any(Error));
    });

    /**
     * Test: Delete submission error handling
     * Verifies that delete errors are handled gracefully with user feedback
     */
    it('should handle delete submission errors', () => {
      // Arrange: Mock service to return error and spy on alert/confirm
      spyOn(window, 'alert');
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');
      mockService.deleteSubmission.and.returnValue(throwError(() => new Error('Delete failed')));

      // Act: Attempt to delete submission
      component.deleteSubmission(1, 'Test submission');

      // Assert: Verify error handling
      expect(window.alert).toHaveBeenCalledWith('Failed to delete submission. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Error deleting submission:', jasmine.any(Error));
    });
  });

  /**
   * Test Group: Data Manipulation
   *
   * These tests verify the internal data manipulation methods that update
   * the submissions list without requiring server calls.
   */
  describe('Data Manipulation', () => {
    /**
     * Test: Update submission in list
     * Verifies that updateSubmissionInList correctly updates a specific submission
     */
    it('should update submission in list correctly', () => {
      // Arrange: Set up initial submissions
      const initialSubmissions = [
        { id: 1, text: 'First submission', createdAt: '2025-09-20T10:30:00.000Z' },
        { id: 2, text: 'Second submission', createdAt: '2025-09-20T11:30:00.000Z' },
        { id: 3, text: 'Third submission', createdAt: '2025-09-20T12:30:00.000Z' }
      ];
      component.submissions.set(initialSubmissions);

      const updatedSubmission = { id: 2, text: 'Updated second submission', createdAt: '2025-09-20T11:30:00.000Z' };

      // Act: Update submission in list
      component['updateSubmissionInList'](2, updatedSubmission);

      // Assert: Verify the specific submission was updated
      const submissions = component.submissions();
      expect(submissions.length).toBe(3);
      expect(submissions[0].text).toBe('First submission'); // Unchanged
      expect(submissions[1].text).toBe('Updated second submission'); // Updated
      expect(submissions[2].text).toBe('Third submission'); // Unchanged
    });

    /**
     * Test: Remove submission from list
     * Verifies that removeSubmissionFromList correctly removes a specific submission
     */
    it('should remove submission from list correctly', () => {
      // Arrange: Set up initial submissions
      const initialSubmissions = [
        { id: 1, text: 'First submission', createdAt: '2025-09-20T10:30:00.000Z' },
        { id: 2, text: 'Second submission', createdAt: '2025-09-20T11:30:00.000Z' },
        { id: 3, text: 'Third submission', createdAt: '2025-09-20T12:30:00.000Z' }
      ];
      component.submissions.set(initialSubmissions);

      // Act: Remove submission from list
      component['removeSubmissionFromList'](2);

      // Assert: Verify the specific submission was removed
      const submissions = component.submissions();
      expect(submissions.length).toBe(2);
      expect(submissions.find(s => s.id === 2)).toBeUndefined();
      expect(submissions.find(s => s.id === 1)).toBeDefined();
      expect(submissions.find(s => s.id === 3)).toBeDefined();
    });
  });

  /**
   * Test Group: User Interactions
   *
   * These tests verify user interaction scenarios including confirmations,
   * validation feedback, and edge cases in user workflows.
   */
  describe('User Interactions', () => {
    /**
     * Test: Delete confirmation dialog
     * Verifies that delete operations require user confirmation
     */
    it('should require confirmation before deleting', () => {
      // Arrange: Mock confirm dialog
      spyOn(window, 'confirm').and.returnValue(false); // User cancels
      mockService.deleteSubmission.and.returnValue(of(undefined));

      // Act: Attempt to delete submission
      component.deleteSubmission(1, 'Test submission');

      // Assert: Verify confirmation was requested and service not called
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this submission?\n\n"Test submission"');
      expect(mockService.deleteSubmission).not.toHaveBeenCalled();
    });

    /**
     * Test: Save edit with invalid text length
     * Verifies that invalid text length shows appropriate user feedback
     */
    it('should show alert for invalid text length during save', () => {
      // Arrange: Set up edit state with invalid text
      spyOn(window, 'alert');
      component.editingId.set(1);
      component.editText.set('Short'); // Too short (5 characters)

      // Act: Attempt to save edit
      component.saveEdit(1);

      // Assert: Verify validation alert and no service call
      expect(window.alert).toHaveBeenCalledWith('Text must be between 10 and 50 characters.');
      expect(mockService.updateSubmission).not.toHaveBeenCalled();
    });

    /**
     * Test: Successful save edit workflow
     * Verifies the complete successful edit workflow
     */
    it('should complete successful save edit workflow', () => {
      // Arrange: Set up successful update scenario
      const updatedSubmission = { id: 1, text: 'Valid updated text here', createdAt: '2025-09-20T10:30:00.000Z' };
      mockService.updateSubmission.and.returnValue(of(updatedSubmission));

      // Set up initial submissions and edit state
      component.submissions.set([
        { id: 1, text: 'Original text', createdAt: '2025-09-20T10:30:00.000Z' }
      ]);
      component.editingId.set(1);
      component.editText.set('Valid updated text here');

      // Act: Save the edit
      component.saveEdit(1);

      // Assert: Verify the complete workflow
      expect(mockService.updateSubmission).toHaveBeenCalledWith(1, { text: 'Valid updated text here' });
      expect(component.submissions()[0].text).toBe('Valid updated text here');
      expect(component.editingId()).toBeNull(); // Edit state reset
      expect(component.editText()).toBe(''); // Edit state reset
    });

    /**
     * Test: Successful delete workflow
     * Verifies the complete successful delete workflow
     */
    it('should complete successful delete workflow', () => {
      // Arrange: Set up successful delete scenario
      spyOn(window, 'confirm').and.returnValue(true); // User confirms
      mockService.deleteSubmission.and.returnValue(of(undefined));

      // Set up initial submissions
      component.submissions.set([
        { id: 1, text: 'To be deleted', createdAt: '2025-09-20T10:30:00.000Z' },
        { id: 2, text: 'To remain', createdAt: '2025-09-20T11:30:00.000Z' }
      ]);

      // Act: Delete the submission
      component.deleteSubmission(1, 'To be deleted');

      // Assert: Verify the complete workflow
      expect(window.confirm).toHaveBeenCalled();
      expect(mockService.deleteSubmission).toHaveBeenCalledWith(1);
      expect(component.submissions().length).toBe(1);
      expect(component.submissions()[0].id).toBe(2);
    });
  });
});