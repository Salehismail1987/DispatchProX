import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ticket-status-dot',
  templateUrl: './ticket-status-dot.component.html',
  styleUrls: ['./ticket-status-dot.component.css']
})
export class TicketStatusDotComponent implements OnInit {

  @Input('status') status : any;
  constructor() { }

  ngOnInit(): void {
  }

}
