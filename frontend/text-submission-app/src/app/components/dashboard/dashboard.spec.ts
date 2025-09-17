// Import Angular testing utilities for component testing
import { ComponentFixture, TestBed } from '@angular/core/testing';
// Import HTTP testing module to mock HTTP requests
import { HttpClientTestingModule } from '@angular/common/http/testing';
// Import FormsModule for two-way data binding (ngModel) in the component
import { FormsModule } from '@angular/forms';
// Import RxJS 'of' operator to create mock observables
import { of } from 'rxjs';

// Import the component we want to test
import { Dashboard } from './dashboard';
// Import the service that the component depends on
import { TextSubmissionService } from '../../services/text-submission';

// Test suite for the Dashboard component
describe('Dashboard', () => {
  // Variable to hold the component instance being tested
  let component: Dashboard;
  // Variable to hold the component fixture (wrapper around component for testing)
  let fixture: ComponentFixture<Dashboard>;
  // Variable to hold the mocked service with spy methods
  let mockTextSubmissionService: jasmine.SpyObj<TextSubmissionService>;

  // Setup function that runs before each test case
  beforeEach(async () => {
    // Create a spy object for TextSubmissionService with mock methods
    // This allows us to control what the service returns without making real HTTP calls
    const spy = jasmine.createSpyObj('TextSubmissionService', ['getSubmissions']);

    // Configure the Angular testing module
    await TestBed.configureTestingModule({
      // Import the Dashboard component and required modules
      imports: [
        Dashboard,              // The component we're testing
        HttpClientTestingModule, // Mock HTTP client for testing
        FormsModule             // Required for ngModel in the component
      ],
      // Provide mock services
      providers: [
        // Replace the real TextSubmissionService with our spy/mock
        { provide: TextSubmissionService, useValue: spy }
      ]
    })
    .compileComponents(); // Compile the component and its template

    // Create a component fixture (test wrapper around the component)
    fixture = TestBed.createComponent(Dashboard);
    // Get the actual component instance from the fixture
    component = fixture.componentInstance;
    // Get the mocked service instance for use in tests
    mockTextSubmissionService = TestBed.inject(TextSubmissionService) as jasmine.SpyObj<TextSubmissionService>;
  });

  // Individual test case to verify edit functionality
  it('should make row text editable when edit button is clicked', () => {

    // ==================== ARRANGE PHASE ====================
    // Set up the test data and mock service behavior

    // Create mock submission data that the component will display
    const mockSubmissions = [
      {
        id: 1,                                    // Unique identifier for the submission
        text: 'Test submission',                  // The text content to display
        createdAt: '2025-09-17T00:00:00.000Z'    // ISO date string for creation time
      }
    ];

    // Configure the mock service to return our test data when getSubmissions() is called
    // 'of()' creates an Observable that immediately emits the mock data
    mockTextSubmissionService.getSubmissions.and.returnValue(of(mockSubmissions));

    // ==================== ACT PHASE ====================
    // Execute the component initialization and trigger rendering

    // Call ngOnInit() to simulate component lifecycle initialization
    // This will call the service to load submissions
    component.ngOnInit();

    // Trigger Angular change detection to update the DOM
    // This renders the component template with the mock data
    fixture.detectChanges();

    // ==================== INITIAL STATE VERIFICATION ====================
    // Verify the component starts in the correct non-editing state

    // Check that no row is currently being edited
    // editingId() should return null when no editing is happening
    expect(component.editingId()).toBeNull();

    // Verify that no edit textarea elements exist in the DOM initially
    // querySelectorAll returns all elements with class 'edit-textarea'
    let textareas = fixture.nativeElement.querySelectorAll('.edit-textarea');
    expect(textareas.length).toBe(0); // Should be 0 initially

    // ==================== USER INTERACTION ====================
    // Simulate user clicking the edit button

    // Find the edit button in the rendered DOM
    // querySelector finds the first element with class 'edit-btn'
    const editButton = fixture.nativeElement.querySelector('.edit-btn');

    // Verify the edit button exists (should be truthy/not null)
    expect(editButton).toBeTruthy();

    // Simulate user clicking the edit button
    editButton.click();

    // Trigger change detection to update the DOM after the click
    // This allows Angular to re-render the component with the new state
    fixture.detectChanges();

    // ==================== ASSERT PHASE ====================
    // Verify that the component and DOM have changed correctly after clicking edit

    // ========== Component State Verification ==========
    // Check that the component's internal state has changed to edit mode

    // editingId() should now contain the ID of the submission being edited
    expect(component.editingId()).toBe(1);

    // editText() should contain the text of the submission being edited
    // This is used to populate the textarea with the current text
    expect(component.editText()).toBe('Test submission');

    // ========== DOM Changes Verification ==========
    // Check that the UI has changed to show editing elements

    // Now there should be exactly one textarea for editing
    // Re-query the DOM since it has changed after the click
    textareas = fixture.nativeElement.querySelectorAll('.edit-textarea');
    expect(textareas.length).toBe(1); // Should now be 1 (edit mode active)

    // ========== Edit Mode UI Elements ==========
    // Verify that Save and Cancel buttons are now visible

    // Find the Save button (should appear when in edit mode)
    const saveButton = fixture.nativeElement.querySelector('.save-btn');
    expect(saveButton).toBeTruthy(); // Should exist and be visible

    // Find the Cancel button (should appear when in edit mode)
    const cancelButton = fixture.nativeElement.querySelector('.cancel-btn');
    expect(cancelButton).toBeTruthy(); // Should exist and be visible

    // ========== Original Button State ==========
    // Verify that the original Edit button is hidden during edit mode

    // Query for edit buttons again (should be hidden when editing)
    const editButtons = fixture.nativeElement.querySelectorAll('.edit-btn');
    expect(editButtons.length).toBe(0); // Should be 0 (hidden during edit mode)

    // ==================== TEST COMPLETE ====================
    // At this point we have verified that clicking the edit button:
    // 1. Changes component state (editingId and editText)
    // 2. Shows a textarea for editing
    // 3. Shows Save and Cancel buttons
    // 4. Hides the original Edit button
    // This confirms that the row text becomes editable as required
  });
});
