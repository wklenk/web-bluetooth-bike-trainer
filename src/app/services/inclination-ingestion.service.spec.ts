import { TestBed } from '@angular/core/testing';

import { InclinationIngestionService } from './inclination-ingestion.service';

describe('InclinationIngestionService', () => {
  let service: InclinationIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InclinationIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
