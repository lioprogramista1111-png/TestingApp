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
}
