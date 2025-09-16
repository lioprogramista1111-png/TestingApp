import { TestBed } from '@angular/core/testing';

import { TextSubmission } from './text-submission';

describe('TextSubmission', () => {
  let service: TextSubmission;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextSubmission);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
