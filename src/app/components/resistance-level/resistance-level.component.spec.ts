import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResistanceLevelComponent } from './resistance-level.component';

describe('ResistanceLevelComponent', () => {
  let component: ResistanceLevelComponent;
  let fixture: ComponentFixture<ResistanceLevelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResistanceLevelComponent]
    });
    fixture = TestBed.createComponent(ResistanceLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
