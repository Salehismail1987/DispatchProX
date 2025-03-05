import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TcTrialScreenClosedTicketsComponent } from './tc-trial-screen-closed-tickets.component';

describe('TcTrialScreenClosedTicketsComponent', () => {
  let component: TcTrialScreenClosedTicketsComponent;
  let fixture: ComponentFixture<TcTrialScreenClosedTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TcTrialScreenClosedTicketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TcTrialScreenClosedTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
