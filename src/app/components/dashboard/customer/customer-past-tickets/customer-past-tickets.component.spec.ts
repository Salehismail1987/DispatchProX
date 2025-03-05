import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPastTicketsComponent } from './customer-past-tickets.component';

describe('CustomerPastTicketsComponent', () => {
  let component: CustomerPastTicketsComponent;
  let fixture: ComponentFixture<CustomerPastTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerPastTicketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPastTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
