import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedComponent } from './speed.component';

describe('SpeedComponent', () => {
  let component: SpeedComponent;
  let fixture: ComponentFixture<SpeedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeedComponent]
    });
    fixture = TestBed.createComponent(SpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
