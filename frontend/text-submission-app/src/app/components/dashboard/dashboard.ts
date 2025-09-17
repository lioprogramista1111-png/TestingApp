import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextSubmissionService, TextSubmissionModel } from '../../services/text-submission';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  submissions = signal<TextSubmissionModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  editingId = signal<number | null>(null);
  editText = signal('');

  constructor(private textSubmissionService: TextSubmissionService) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.textSubmissionService.getSubmissions().subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load submissions. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading submissions:', error);
      }
    });
  }

  refreshSubmissions() {
    this.loadSubmissions();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  startEdit(submission: TextSubmissionModel) {
    this.editingId.set(submission.id);
    this.editText.set(submission.text);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editText.set('');
  }

  saveEdit(id: number) {
    const updatedText = this.editText().trim();

    if (updatedText.length < 10 || updatedText.length > 50) {
      alert('Text must be between 10 and 50 characters.');
      return;
    }

    this.textSubmissionService.updateSubmission(id, { text: updatedText }).subscribe({
      next: (updatedSubmission) => {
        const currentSubmissions = this.submissions();
        const updatedSubmissions = currentSubmissions.map(sub =>
          sub.id === id ? updatedSubmission : sub
        );
        this.submissions.set(updatedSubmissions);
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating submission:', error);
        alert('Failed to update submission. Please try again.');
      }
    });
  }

  deleteSubmission(id: number, text: string) {
    if (confirm(`Are you sure you want to delete this submission?\n\n"${text}"`)) {
      this.textSubmissionService.deleteSubmission(id).subscribe({
        next: () => {
          const currentSubmissions = this.submissions();
          const filteredSubmissions = currentSubmissions.filter(sub => sub.id !== id);
          this.submissions.set(filteredSubmissions);
        },
        error: (error) => {
          console.error('Error deleting submission:', error);
          alert('Failed to delete submission. Please try again.');
        }
      });
    }
  }
}
