import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessMachineComponent } from './fitness-machine.component';

describe('FitnessMachineComponent', () => {
  let component: FitnessMachineComponent;
  let fixture: ComponentFixture<FitnessMachineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FitnessMachineComponent]
    });
    fixture = TestBed.createComponent(FitnessMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
