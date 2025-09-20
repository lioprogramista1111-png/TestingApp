import { Component, OnInit, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextSubmissionService, TextSubmissionModel } from '../../services/text-submission';

// Constants for validation
const TEXT_MIN_LENGTH = 10;
const TEXT_MAX_LENGTH = 50;

// Error messages
const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load submissions. Please try again.',
  UPDATE_FAILED: 'Failed to update submission. Please try again.',
  DELETE_FAILED: 'Failed to delete submission. Please try again.',
  INVALID_LENGTH: `Text must be between ${TEXT_MIN_LENGTH} and ${TEXT_MAX_LENGTH} characters.`
} as const;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // Input signal to trigger refresh when new submissions are added
  readonly refreshTrigger = input<number>(0);

  // State signals
  readonly submissions = signal<TextSubmissionModel[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly editingId = signal<number | null>(null);
  readonly editText = signal('');

  constructor(private readonly textSubmissionService: TextSubmissionService) {
    // Effect to watch for refresh trigger changes
    effect(() => {
      const trigger = this.refreshTrigger();
      if (trigger > 0) {
        // Small delay to ensure the new submission is saved before refreshing
        setTimeout(() => this.loadSubmissions(), 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Dashboard: ngOnInit called');
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    console.log('Dashboard: Starting to load submissions...');
    this.setLoadingState(true);

    this.textSubmissionService.getSubmissions().subscribe({
      next: (submissions) => {
        console.log('Dashboard: Received submissions:', submissions);
        console.log('Dashboard: Submissions length:', submissions.length);
        console.log('Dashboard: Setting submissions in signal...');
        this.submissions.set(submissions);
        console.log('Dashboard: Current submissions signal value:', this.submissions());
        this.setLoadingState(false);
        console.log('Dashboard: Loading state set to false');
      },
      error: (error) => {
        console.error('Dashboard: Error loading submissions:', error);
        this.handleError(ERROR_MESSAGES.LOAD_FAILED, error);
        this.setLoadingState(false);
      }
    });
  }

  refreshSubmissions(): void {
    this.loadSubmissions();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Helper methods
  private setLoadingState(loading: boolean): void {
    this.isLoading.set(loading);
    if (loading) {
      this.errorMessage.set('');
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage.set(message);
    console.error('Dashboard error:', error);
  }

  // Edit operations
  startEdit(submission: TextSubmissionModel): void {
    this.editingId.set(submission.id);
    this.editText.set(submission.text);
  }

  cancelEdit(): void {
    this.resetEditState();
  }

  saveEdit(id: number): void {
    const updatedText = this.editText().trim();

    if (!this.isValidTextLength(updatedText)) {
      alert(ERROR_MESSAGES.INVALID_LENGTH);
      return;
    }

    this.textSubmissionService.updateSubmission(id, { text: updatedText }).subscribe({
      next: (updatedSubmission) => {
        this.updateSubmissionInList(id, updatedSubmission);
        this.resetEditState();
      },
      error: (error) => {
        console.error('Error updating submission:', error);
        alert(ERROR_MESSAGES.UPDATE_FAILED);
      }
    });
  }

  deleteSubmission(id: number, text: string): void {
    if (!this.confirmDelete(text)) return;

    this.textSubmissionService.deleteSubmission(id).subscribe({
      next: () => {
        this.removeSubmissionFromList(id);
      },
      error: (error) => {
        console.error('Error deleting submission:', error);
        alert(ERROR_MESSAGES.DELETE_FAILED);
      }
    });
  }

  // Private helper methods
  private resetEditState(): void {
    this.editingId.set(null);
    this.editText.set('');
  }

  private isValidTextLength(text: string): boolean {
    return text.length >= TEXT_MIN_LENGTH && text.length <= TEXT_MAX_LENGTH;
  }

  private confirmDelete(text: string): boolean {
    return confirm(`Are you sure you want to delete this submission?\n\n"${text}"`);
  }

  private updateSubmissionInList(id: number, updatedSubmission: TextSubmissionModel): void {
    const currentSubmissions = this.submissions();
    const updatedSubmissions = currentSubmissions.map(sub =>
      sub.id === id ? updatedSubmission : sub
    );
    this.submissions.set(updatedSubmissions);
  }

  private removeSubmissionFromList(id: number): void {
    const currentSubmissions = this.submissions();
    const filteredSubmissions = currentSubmissions.filter(sub => sub.id !== id);
    this.submissions.set(filteredSubmissions);
  }
}
