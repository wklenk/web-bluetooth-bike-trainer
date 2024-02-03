import { TestBed } from '@angular/core/testing';

import { FitnessMachineService } from './fitness-machine.service';

describe('FitnessMachineService', () => {
  let service: FitnessMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FitnessMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
