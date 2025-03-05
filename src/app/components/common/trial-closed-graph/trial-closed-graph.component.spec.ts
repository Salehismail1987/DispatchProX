import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialClosedGraphComponent } from './trial-closed-graph.component';

describe('TrialClosedGraphComponent', () => {
  let component: TrialClosedGraphComponent;
  let fixture: ComponentFixture<TrialClosedGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrialClosedGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialClosedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
