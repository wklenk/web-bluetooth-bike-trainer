import { TestBed } from '@angular/core/testing';
import { TargetPowerIngestionService } from './target-power-ingestion.service';


describe('RestistanceLevelIngestionService', () => {
  let service: TargetPowerIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetPowerIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
