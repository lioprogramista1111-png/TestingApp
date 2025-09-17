import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://localhost:7014/api/TextSubmission'
} as const;

// Data Transfer Objects
export interface TextSubmissionModel {
  readonly id: number;
  readonly text: string;
  readonly createdAt: string;
}

export interface TextSubmissionRequest {
  readonly text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextSubmissionService {
  private readonly apiUrl = API_CONFIG.BASE_URL;

  constructor(private readonly http: HttpClient) {}

  /**
   * Submit a new text submission
   */
  submitText(request: TextSubmissionRequest): Observable<TextSubmissionModel> {
    return this.http.post<TextSubmissionModel>(this.apiUrl, request);
  }

  /**
   * Get all text submissions
   */
  getSubmissions(): Observable<TextSubmissionModel[]> {
    return this.http.get<TextSubmissionModel[]>(this.apiUrl);
  }

  /**
   * Update an existing text submission
   */
  updateSubmission(id: number, request: TextSubmissionRequest): Observable<TextSubmissionModel> {
    return this.http.put<TextSubmissionModel>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a text submission
   */
  deleteSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
