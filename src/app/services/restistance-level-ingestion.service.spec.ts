import { TestBed } from '@angular/core/testing';
import { ResistanceLevelIngestionService } from './restistance-level-ingestion.service';


describe('RestistanceLevelIngestionService', () => {
  let service: ResistanceLevelIngestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResistanceLevelIngestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
