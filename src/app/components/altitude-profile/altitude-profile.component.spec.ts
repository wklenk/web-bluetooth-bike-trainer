import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltitudeProfileComponent } from './altitude-profile.component';

describe('AltitudeProfileComponent', () => {
  let component: AltitudeProfileComponent;
  let fixture: ComponentFixture<AltitudeProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AltitudeProfileComponent]
    });
    fixture = TestBed.createComponent(AltitudeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
