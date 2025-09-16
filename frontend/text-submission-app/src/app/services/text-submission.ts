import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TextSubmissionModel {
  id: number;
  text: string;
  createdAt: string;
}

export interface TextSubmissionRequest {
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextSubmissionService {
  private apiUrl = 'https://localhost:7014/api/TextSubmission'; // HTTPS port from launch settings

  constructor(private http: HttpClient) { }

  submitText(request: TextSubmissionRequest): Observable<TextSubmissionModel> {
    return this.http.post<TextSubmissionModel>(this.apiUrl, request);
  }

  getSubmissions(): Observable<TextSubmissionModel[]> {
    return this.http.get<TextSubmissionModel[]>(this.apiUrl);
  }
}
