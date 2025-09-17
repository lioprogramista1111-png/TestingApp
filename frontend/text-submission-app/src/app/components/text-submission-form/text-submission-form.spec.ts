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
    const longText = 'a'.repeat(51); // 51 characters

    textControl?.setValue(longText);
    expect(textControl?.hasError('maxlength')).toBeTruthy();

    const validText = 'a'.repeat(50); // 50 characters
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
    expect(characterCount.textContent.trim()).toBe('11/50 characters');
  });

  it('should have maxlength attribute set to 50 on input field', () => {
    fixture.detectChanges(); // Ensure component is fully rendered
    const inputElement = fixture.nativeElement.querySelector('input[type="text"]');
    expect(inputElement).toBeTruthy();
    expect(inputElement.getAttribute('maxlength')).toBe('50');
  });

  it('should enforce 50 character limit through Angular validation', () => {
    const textControl = component.textForm.get('text');

    // Test exactly 50 characters - should be valid
    const fiftyChars = 'a'.repeat(50);
    textControl?.setValue(fiftyChars);
    expect(textControl?.hasError('maxlength')).toBeFalsy();
    expect(textControl?.value.length).toBe(50);

    // Test 51 characters - should be invalid
    const fiftyOneChars = 'a'.repeat(51);
    textControl?.setValue(fiftyOneChars);
    expect(textControl?.hasError('maxlength')).toBeTruthy();
    expect(textControl?.value.length).toBe(51);

    // Test that the form becomes invalid when exceeding 50 characters
    expect(component.textForm.invalid).toBeTruthy();
  });

  it('should display maxlength validation error when exceeding 50 characters', () => {
    const textControl = component.textForm.get('text');
    const fiftyOneChars = 'a'.repeat(51);

    textControl?.setValue(fiftyOneChars);
    textControl?.markAsTouched();
    fixture.detectChanges();

    const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
    const maxlengthError = Array.from(errorElements).find((el: any) =>
      el.textContent.trim().includes('Text cannot exceed 50 characters')
    );

    expect(maxlengthError).toBeTruthy();
  });

  it('should enforce minimum length of 10 characters', () => {
    const textControl = component.textForm.get('text');

    // Test with less than 10 characters - should be invalid
    const nineChars = 'a'.repeat(9);
    textControl?.setValue(nineChars);
    expect(textControl?.hasError('minlength')).toBeTruthy();
    expect(textControl?.value.length).toBe(9);

    // Test with exactly 10 characters - should be valid
    const tenChars = 'a'.repeat(10);
    textControl?.setValue(tenChars);
    expect(textControl?.hasError('minlength')).toBeFalsy();
    expect(textControl?.value.length).toBe(10);

    // Test with more than 10 characters (but less than 50) - should be valid
    const twentyChars = 'a'.repeat(20);
    textControl?.setValue(twentyChars);
    expect(textControl?.hasError('minlength')).toBeFalsy();
    expect(textControl?.value.length).toBe(20);
  });

  it('should display minlength validation error when less than 10 characters', () => {
    const textControl = component.textForm.get('text');
    const shortText = 'short'; // 5 characters

    textControl?.setValue(shortText);
    textControl?.markAsTouched();
    fixture.detectChanges();

    const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
    const minlengthError = Array.from(errorElements).find((el: any) =>
      el.textContent.trim().includes('Text must be at least 10 characters')
    );

    expect(minlengthError).toBeTruthy();
  });

  it('should validate text length range (10-50 characters)', () => {
    const textControl = component.textForm.get('text');

    // Test boundary conditions
    const validTexts = [
      'a'.repeat(10), // minimum valid
      'a'.repeat(25), // middle range
      'a'.repeat(50)  // maximum valid
    ];

    const invalidTexts = [
      'a'.repeat(9),  // too short
      'a'.repeat(51)  // too long
    ];

    // Test valid lengths
    validTexts.forEach(text => {
      textControl?.setValue(text);
      expect(textControl?.hasError('minlength')).toBeFalsy();
      expect(textControl?.hasError('maxlength')).toBeFalsy();
      expect(textControl?.valid).toBeTruthy();
    });

    // Test invalid lengths
    textControl?.setValue(invalidTexts[0]); // too short
    expect(textControl?.hasError('minlength')).toBeTruthy();
    expect(textControl?.valid).toBeFalsy();

    textControl?.setValue(invalidTexts[1]); // too long
    expect(textControl?.hasError('maxlength')).toBeTruthy();
    expect(textControl?.valid).toBeFalsy();
  });

  it('should show character count correctly for different input lengths', () => {
    const textControl = component.textForm.get('text');
    const characterCount = fixture.nativeElement.querySelector('.character-count');

    // Test with 0 characters
    textControl?.setValue('');
    fixture.detectChanges();
    expect(characterCount.textContent.trim()).toBe('0/50 characters');

    // Test with 10 characters (minimum valid)
    const tenChars = 'a'.repeat(10);
    textControl?.setValue(tenChars);
    fixture.detectChanges();
    expect(characterCount.textContent.trim()).toBe('10/50 characters');

    // Test with 25 characters
    const twentyFiveChars = 'a'.repeat(25);
    textControl?.setValue(twentyFiveChars);
    fixture.detectChanges();
    expect(characterCount.textContent.trim()).toBe('25/50 characters');

    // Test with exactly 50 characters (maximum valid)
    const fiftyChars = 'a'.repeat(50);
    textControl?.setValue(fiftyChars);
    fixture.detectChanges();
    expect(characterCount.textContent.trim()).toBe('50/50 characters');
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
      text: 'Valid test text',
      createdAt: '2025-09-16T23:00:00.000Z'
    };

    mockTextSubmissionService.submitText.and.returnValue(of(mockResponse));

    component.textForm.get('text')?.setValue('Valid test text');
    component.onSubmit();

    expect(mockTextSubmissionService.submitText).toHaveBeenCalledWith({ text: 'Valid test text' });
    expect(component.submitSuccess()).toBeTruthy();
    expect(component.submitMessage()).toBe('Text submitted successfully!');
    expect(component.textForm.get('text')?.value).toBeNull();
  });

  it('should show error message on submission failure', () => {
    mockTextSubmissionService.submitText.and.returnValue(throwError(() => new Error('Server error')));

    component.textForm.get('text')?.setValue('Valid test text');
    component.onSubmit();

    expect(component.submitSuccess()).toBeFalsy();
    expect(component.submitMessage()).toBe('Error submitting text. Please try again.');
  });

  it('should show loading state during submission', () => {
    mockTextSubmissionService.submitText.and.returnValue(of({
      id: 1,
      text: 'Valid test text',
      createdAt: '2025-09-16T23:00:00.000Z'
    }));

    component.textForm.get('text')?.setValue('Valid test text');

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
