/**
 * Dashboard Component Unit Tests
 *
 * This file contains unit tests for the Dashboard component which displays
 * a table of text submissions with edit and delete functionality.
 *
 * Testing Strategy:
 * - Use mocked services to isolate component logic
 * - Test core functionality without complex DOM interactions
 * - Focus on component behavior and method calls
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
   * Setup before each test
   *
   * This runs before every individual test case and:
   * 1. Creates a mock service with spy methods
   * 2. Configures the Angular testing module
   * 3. Creates the component instance for testing
   */
  beforeEach(async () => {
    // Create a spy object for the TextSubmissionService
    // This allows us to mock service methods and track if they're called
    mockService = jasmine.createSpyObj('TextSubmissionService', ['getSubmissions']);

    // Configure the mock to return an empty array when getSubmissions is called
    // 'of([])' creates an Observable that immediately emits an empty array
    mockService.getSubmissions.and.returnValue(of([]));

    // Configure the Angular testing module
    await TestBed.configureTestingModule({
      imports: [Dashboard], // Import the standalone component
      providers: [
        // Replace the real service with our mock
        { provide: TextSubmissionService, useValue: mockService }
      ]
    }).compileComponents();

    // Create the component and get a reference to it
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  /**
   * Test 1: Component Creation
   *
   * This is the most basic test that verifies the component can be created
   * without throwing any errors. It's a smoke test that ensures the component
   * is properly configured and all dependencies are satisfied.
   */
  it('should create the dashboard component successfully', () => {
    // Assert that the component instance exists and is truthy
    expect(component).toBeTruthy();

    // Additional verification: check that component has expected properties
    expect(component.submissions).toBeDefined();
    expect(component.isLoading).toBeDefined();
    expect(component.errorMessage).toBeDefined();
  });

  /**
   * Test 2: Service Integration
   *
   * This test verifies that the component properly calls the service
   * when it initializes. This is important because the dashboard needs
   * to load data when the user first visits the page.
   *
   * Testing Pattern: Arrange-Act-Assert
   * - Arrange: Setup is done in beforeEach
   * - Act: Call the method we want to test
   * - Assert: Verify the expected behavior occurred
   */
  it('should load submissions when component initializes', () => {
    // Act: Trigger the component's initialization lifecycle
    component.ngOnInit();

    // Assert: Verify that the service method was called
    expect(mockService.getSubmissions).toHaveBeenCalled();

    // Additional verification: ensure it was called exactly once
    expect(mockService.getSubmissions).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 3: Date Formatting
   *
   * This test verifies that the formatDate method correctly converts
   * ISO date strings into a human-readable format. This is important
   * for displaying submission timestamps in the dashboard table.
   *
   * We test with a known input and verify the output contains expected content.
   */
  it('should format ISO date string to readable format', () => {
    // Arrange: Prepare test data
    const testDate = '2025-09-20T10:30:00.000Z';

    // Act: Call the method we want to test
    const result = component.formatDate(testDate);

    // Assert: Verify the result contains expected content
    expect(result).toContain('2025');

    // Additional verification: ensure result is a string and not empty
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  /**
   * Test 4: Error Handling
   *
   * This test verifies that the component properly handles errors
   * when the service fails to load submissions. We suppress console
   * errors since they're expected in this test scenario.
   */
  it('should handle service errors gracefully', () => {
    // Arrange: Suppress expected console errors during this test
    spyOn(console, 'error');

    // Configure the mock to return an error
    const errorMessage = 'Service error';
    mockService.getSubmissions.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    // Act: Trigger the component initialization
    component.ngOnInit();

    // Assert: Verify error handling
    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBeFalsy();

    // Verify that console.error was called (error was logged)
    expect(console.error).toHaveBeenCalled();
  });

  /**
   * Test 5: Initial State Verification
   *
   * This test verifies that the component starts with the correct
   * initial state values for all signals.
   */
  it('should have correct initial state', () => {
    // Assert: Verify initial signal values
    expect(component.submissions()).toEqual([]);
    expect(component.isLoading()).toBeFalsy();
    expect(component.errorMessage()).toBe('');
    expect(component.editingId()).toBeNull();
    expect(component.editText()).toBe('');
  });

  /**
   * Test 6: Refresh Functionality
   *
   * This test verifies that the refresh method properly calls
   * the loadSubmissions method again.
   */
  it('should refresh submissions when refresh method is called', () => {
    // Arrange: Spy on the loadSubmissions method
    spyOn(component, 'loadSubmissions');

    // Act: Call refresh
    component.refreshSubmissions();

    // Assert: Verify loadSubmissions was called
    expect(component.loadSubmissions).toHaveBeenCalled();
  });
});