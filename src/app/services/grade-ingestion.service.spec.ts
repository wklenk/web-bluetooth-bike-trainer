import { TestBed } from '@angular/core/testing';

import { GradeIngestionService } from './grade-ingestion.service';

describe('GradeIngestionService', () => {
  let service: GradeIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradeIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
