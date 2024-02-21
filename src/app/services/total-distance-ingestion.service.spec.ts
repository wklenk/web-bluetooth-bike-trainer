import { TestBed } from '@angular/core/testing';

import { TotalDistanceIngestionService } from './total-distance-ingestion.service';

describe('TotalDistanceIngestionService', () => {
  let service: TotalDistanceIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalDistanceIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
