import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextSubmissionForm } from './components/text-submission-form/text-submission-form';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TextSubmissionForm, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Text Submission Application');

  // Signal to trigger dashboard refresh when new submissions are added
  protected readonly dashboardRefreshTrigger = signal(0);

  /**
   * Handle when a new submission is added from the form
   * This will trigger the dashboard to refresh and show the new submission
   */
  onSubmissionAdded(): void {
    // Increment the trigger to notify dashboard to refresh
    this.dashboardRefreshTrigger.update(current => current + 1);
  }
}
