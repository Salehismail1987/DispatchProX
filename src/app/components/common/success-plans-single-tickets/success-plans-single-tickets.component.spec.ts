import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPlansSingleTicketsComponent } from './success-plans-single-tickets.component';

describe('SuccessPlansSingleTicketsComponent', () => {
  let component: SuccessPlansSingleTicketsComponent;
  let fixture: ComponentFixture<SuccessPlansSingleTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessPlansSingleTicketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessPlansSingleTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
