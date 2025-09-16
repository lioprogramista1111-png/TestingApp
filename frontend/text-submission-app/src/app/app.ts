import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextSubmissionForm } from './components/text-submission-form/text-submission-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TextSubmissionForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Text Submission Application');
}
