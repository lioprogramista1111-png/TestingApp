import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextSubmissionService } from '../../services/text-submission';

@Component({
  selector: 'app-text-submission-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './text-submission-form.html',
  styleUrl: './text-submission-form.css'
})
export class TextSubmissionForm {
  textForm: FormGroup;
  isSubmitting = signal(false);
  submitMessage = signal('');
  submitSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private textSubmissionService: TextSubmissionService
  ) {
    this.textForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]]
    });
  }

  onSubmit() {
    if (this.textForm.valid) {
      this.isSubmitting.set(true);
      this.submitMessage.set('');

      const request = {
        text: this.textForm.get('text')?.value
      };

      this.textSubmissionService.submitText(request).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.submitMessage.set('Text submitted successfully!');
          this.textForm.reset();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(false);
          this.submitMessage.set('Error submitting text. Please try again.');
          console.error('Submission error:', error);
        }
      });
    }
  }

  get textControl() {
    return this.textForm.get('text');
  }
}
