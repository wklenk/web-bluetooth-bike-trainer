import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InclinationComponent } from './inclination.component';

describe('InclinationComponent', () => {
  let component: InclinationComponent;
  let fixture: ComponentFixture<InclinationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InclinationComponent]
    });
    fixture = TestBed.createComponent(InclinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
