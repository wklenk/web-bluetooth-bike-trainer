import { TestBed } from '@angular/core/testing';

import { ElapsedTimeIngestionService } from './elapsed-time-ingestion.service';

describe('ElapsedTimeIngestionService', () => {
  let service: ElapsedTimeIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElapsedTimeIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
