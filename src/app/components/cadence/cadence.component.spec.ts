import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadenceComponent } from './cadence.component';

describe('CadenceComponent', () => {
  let component: CadenceComponent;
  let fixture: ComponentFixture<CadenceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CadenceComponent]
    });
    fixture = TestBed.createComponent(CadenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
