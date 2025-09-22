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
import { TextSubmissionService } from '../../services/text-submission';

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
    mockService = jasmine.createSpyObj('TextSubmissionService', ['getSubmissions', 'deleteSubmission']);

    // Configure default successful responses
    mockService.getSubmissions.and.returnValue(of([])); // Empty array for no submissions
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
});