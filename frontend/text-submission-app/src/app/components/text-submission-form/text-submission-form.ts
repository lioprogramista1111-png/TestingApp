import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextSubmissionService, TextSubmissionRequest } from '../../services/text-submission';

// Constants for validation
const TEXT_MIN_LENGTH = 10;
const TEXT_MAX_LENGTH = 50;

// Success/Error messages
const MESSAGES = {
  SUCCESS: 'Text submitted successfully!',
  ERROR: 'Error submitting text. Please try again.'
} as const;

@Component({
  selector: 'app-text-submission-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './text-submission-form.html',
  styleUrl: './text-submission-form.css'
})
export class TextSubmissionForm {
  readonly textForm: FormGroup;
  readonly isSubmitting = signal(false);
  readonly submitMessage = signal('');
  readonly submitSuccess = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly textSubmissionService: TextSubmissionService
  ) {
    this.textForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      text: ['', [
        Validators.required,
        Validators.minLength(TEXT_MIN_LENGTH),
        Validators.maxLength(TEXT_MAX_LENGTH)
      ]]
    });
  }

  onSubmit(): void {
    if (!this.textForm.valid) return;

    this.setSubmittingState(true);
    const request = this.createSubmissionRequest();

    this.textSubmissionService.submitText(request).subscribe({
      next: () => this.handleSubmissionSuccess(),
      error: (error) => this.handleSubmissionError(error)
    });
  }

  get textControl(): AbstractControl | null {
    return this.textForm.get('text');
  }

  // Private helper methods
  private createSubmissionRequest(): TextSubmissionRequest {
    return {
      text: this.textControl?.value?.trim() || ''
    };
  }

  private setSubmittingState(submitting: boolean): void {
    this.isSubmitting.set(submitting);
    if (submitting) {
      this.submitMessage.set('');
    }
  }

  private handleSubmissionSuccess(): void {
    this.setSubmittingState(false);
    this.submitSuccess.set(true);
    this.submitMessage.set(MESSAGES.SUCCESS);
    this.textForm.reset();
  }

  private handleSubmissionError(error: any): void {
    this.setSubmittingState(false);
    this.submitSuccess.set(false);
    this.submitMessage.set(MESSAGES.ERROR);
    console.error('Submission error:', error);
  }
}
