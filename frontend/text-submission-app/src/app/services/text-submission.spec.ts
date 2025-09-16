import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TextSubmissionService, TextSubmissionModel, TextSubmissionRequest } from './text-submission';

describe('TextSubmissionService', () => {
  let service: TextSubmissionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TextSubmissionService]
    });
    service = TestBed.inject(TextSubmissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit text successfully', () => {
    const mockRequest: TextSubmissionRequest = { text: 'Test submission' };
    const mockResponse: TextSubmissionModel = {
      id: 1,
      text: 'Test submission',
      createdAt: '2025-09-16T23:00:00.000Z'
    };

    service.submitText(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://localhost:7014/api/TextSubmission');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should get submissions successfully', () => {
    const mockSubmissions: TextSubmissionModel[] = [
      {
        id: 1,
        text: 'Test submission 1',
        createdAt: '2025-09-16T23:00:00.000Z'
      },
      {
        id: 2,
        text: 'Test submission 2',
        createdAt: '2025-09-16T23:01:00.000Z'
      }
    ];

    service.getSubmissions().subscribe(submissions => {
      expect(submissions).toEqual(mockSubmissions);
      expect(submissions.length).toBe(2);
    });

    const req = httpMock.expectOne('https://localhost:7014/api/TextSubmission');
    expect(req.request.method).toBe('GET');
    req.flush(mockSubmissions);
  });

  it('should handle HTTP errors', () => {
    const mockRequest: TextSubmissionRequest = { text: 'Test submission' };

    service.submitText(mockRequest).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('https://localhost:7014/api/TextSubmission');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
