import { TestBed } from '@angular/core/testing';

import { DemoFitnessMachineService } from './demo-fitness-machine.service';

describe('DemoFitnessMachineService', () => {
  let service: DemoFitnessMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoFitnessMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
