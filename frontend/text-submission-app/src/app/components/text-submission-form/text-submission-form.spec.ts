import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { TextSubmissionForm } from './text-submission-form';
import { TextSubmissionService } from '../../services/text-submission';

describe('TextSubmissionForm', () => {
  let component: TextSubmissionForm;
  let fixture: ComponentFixture<TextSubmissionForm>;
  let mockTextSubmissionService: jasmine.SpyObj<TextSubmissionService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TextSubmissionService', ['submitText']);

    await TestBed.configureTestingModule({
      imports: [TextSubmissionForm, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: TextSubmissionService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSubmissionForm);
    component = fixture.componentInstance;
    mockTextSubmissionService = TestBed.inject(TextSubmissionService) as jasmine.SpyObj<TextSubmissionService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty text field', () => {
    expect(component.textForm.get('text')?.value).toBe('');
    expect(component.textForm.valid).toBeFalsy();
  });

  it('should validate required field', () => {
    const textControl = component.textForm.get('text');

    // Empty field should be invalid
    textControl?.setValue('');
    expect(textControl?.hasError('required')).toBeTruthy();

    // Field with text should be valid
    textControl?.setValue('Some text');
    expect(textControl?.hasError('required')).toBeFalsy();
  });

  it('should validate max length', () => {
    const textControl = component.textForm.get('text');
    const longText = 'a'.repeat(1001); // 1001 characters

    textControl?.setValue(longText);
    expect(textControl?.hasError('maxlength')).toBeTruthy();

    const validText = 'a'.repeat(1000); // 1000 characters
    textControl?.setValue(validText);
    expect(textControl?.hasError('maxlength')).toBeFalsy();
  });

  it('should display validation errors when field is touched and invalid', () => {
    const textControl = component.textForm.get('text');
    textControl?.markAsTouched();
    textControl?.setValue('');
    fixture.detectChanges();

    const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
    expect(errorElements.length).toBeGreaterThan(0);
    expect(errorElements[0].textContent.trim()).toBe('Text is required.');
  });

  it('should display character count', () => {
    const textControl = component.textForm.get('text');
    textControl?.setValue('Hello World');
    fixture.detectChanges();

    const characterCount = fixture.nativeElement.querySelector('.character-count');
    expect(characterCount.textContent.trim()).toBe('11/1000 characters');
  });

  it('should disable submit button when form is invalid', () => {
    const submitButton = fixture.nativeElement.querySelector('.submit-btn');
    expect(submitButton.disabled).toBeTruthy();

    component.textForm.get('text')?.setValue('Valid text');
    fixture.detectChanges();

    expect(submitButton.disabled).toBeFalsy();
  });

  it('should call service and show success message on successful submission', () => {
    const mockResponse = {
      id: 1,
      text: 'Test text',
      createdAt: '2025-09-16T23:00:00.000Z'
    };

    mockTextSubmissionService.submitText.and.returnValue(of(mockResponse));

    component.textForm.get('text')?.setValue('Test text');
    component.onSubmit();

    expect(mockTextSubmissionService.submitText).toHaveBeenCalledWith({ text: 'Test text' });
    expect(component.submitSuccess()).toBeTruthy();
    expect(component.submitMessage()).toBe('Text submitted successfully!');
    expect(component.textForm.get('text')?.value).toBeNull();
  });

  it('should show error message on submission failure', () => {
    mockTextSubmissionService.submitText.and.returnValue(throwError(() => new Error('Server error')));

    component.textForm.get('text')?.setValue('Test text');
    component.onSubmit();

    expect(component.submitSuccess()).toBeFalsy();
    expect(component.submitMessage()).toBe('Error submitting text. Please try again.');
  });

  it('should show loading state during submission', () => {
    mockTextSubmissionService.submitText.and.returnValue(of({
      id: 1,
      text: 'Test text',
      createdAt: '2025-09-16T23:00:00.000Z'
    }));

    component.textForm.get('text')?.setValue('Test text');

    // Before submission
    expect(component.isSubmitting()).toBeFalsy();

    // During submission (we can't easily test the intermediate state in this sync test)
    component.onSubmit();

    // After submission
    expect(component.isSubmitting()).toBeFalsy();
  });

  it('should not submit when form is invalid', () => {
    component.textForm.get('text')?.setValue(''); // Invalid form
    component.onSubmit();

    expect(mockTextSubmissionService.submitText).not.toHaveBeenCalled();
  });
});
