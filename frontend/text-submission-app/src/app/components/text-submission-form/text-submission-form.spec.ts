import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSubmissionForm } from './text-submission-form';

describe('TextSubmissionForm', () => {
  let component: TextSubmissionForm;
  let fixture: ComponentFixture<TextSubmissionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextSubmissionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSubmissionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
