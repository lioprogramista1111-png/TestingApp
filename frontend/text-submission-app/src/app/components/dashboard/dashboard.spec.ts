import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { TextSubmissionService } from '../../services/text-submission';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockService: jasmine.SpyObj<TextSubmissionService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TextSubmissionService', ['getSubmissions', 'deleteSubmission']);
    mockService.getSubmissions.and.returnValue(of([]));
    mockService.deleteSubmission.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: TextSubmissionService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load submissions on init', () => {
    component.ngOnInit();
    expect(mockService.getSubmissions).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const testDate = '2025-09-20T10:30:00.000Z';
    const result = component.formatDate(testDate);
    expect(result).toContain('2025');
    expect(typeof result).toBe('string');
  });

  it('should handle errors', () => {
    spyOn(console, 'error');
    mockService.getSubmissions.and.returnValue(throwError(() => new Error('Service error')));

    component.ngOnInit();

    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBeFalsy();
    expect(console.error).toHaveBeenCalled();
  });

  it('should have correct initial state', () => {
    expect(component.submissions()).toEqual([]);
    expect(component.isLoading()).toBeFalsy();
    expect(component.errorMessage()).toBe('');
    expect(component.editingId()).toBeNull();
    expect(component.editText()).toBe('');
  });

  it('should refresh submissions', () => {
    spyOn(component, 'loadSubmissions');
    component.refreshSubmissions();
    expect(component.loadSubmissions).toHaveBeenCalled();
  });

  it('should activate edit mode', () => {
    const mockSubmission = {
      id: 1,
      text: 'Test submission text',
      createdAt: '2025-09-20T10:30:00.000Z'
    };

    component.startEdit(mockSubmission);

    expect(component.editingId()).toBe(1);
    expect(component.editText()).toBe('Test submission text');
  });

  it('should cancel edit mode', () => {
    const mockSubmission = {
      id: 1,
      text: 'Test submission text',
      createdAt: '2025-09-20T10:30:00.000Z'
    };

    component.startEdit(mockSubmission);
    component.cancelEdit();

    expect(component.editingId()).toBeNull();
    expect(component.editText()).toBe('');
  });

  it('should delete submission when confirmed', () => {
    const mockSubmissions = [
      { id: 1, text: 'First submission', createdAt: '2025-09-21T10:00:00.000Z' },
      { id: 2, text: 'Second submission', createdAt: '2025-09-21T11:00:00.000Z' }
    ];

    component.submissions.set(mockSubmissions);
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteSubmission(1, 'First submission');

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this submission?\n\n"First submission"'
    );
    expect(mockService.deleteSubmission).toHaveBeenCalledWith(1);
    expect(component.submissions().length).toBe(1);
    expect(component.submissions().find(s => s.id === 1)).toBeFalsy();
  });

  it('should not delete when cancelled', () => {
    const mockSubmissions = [
      { id: 1, text: 'Test submission', createdAt: '2025-09-21T10:00:00.000Z' }
    ];

    component.submissions.set(mockSubmissions);
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteSubmission(1, 'Test submission');

    expect(window.confirm).toHaveBeenCalled();
    expect(mockService.deleteSubmission).not.toHaveBeenCalled();
    expect(component.submissions().length).toBe(1);
  });

  it('should handle delete errors', () => {
    const mockSubmissions = [
      { id: 1, text: 'Test submission', createdAt: '2025-09-21T10:00:00.000Z' }
    ];

    component.submissions.set(mockSubmissions);
    mockService.deleteSubmission.and.returnValue(throwError(() => new Error('Delete failed')));
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(console, 'error');

    component.deleteSubmission(1, 'Test submission');

    expect(mockService.deleteSubmission).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to delete submission. Please try again.');
    expect(component.submissions().length).toBe(1);
  });
});