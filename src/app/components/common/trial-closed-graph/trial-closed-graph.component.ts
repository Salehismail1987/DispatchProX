import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/app/services/user-data.service';
import Swal from 'sweetalert2';

import * as Highcharts from 'highcharts';
import { Router } from '@angular/router';
import { PlansService } from 'src/app/services/plans.service';
@Component({
  selector: 'app-trial-closed-graph',
  templateUrl: './trial-closed-graph.component.html',
  styleUrls: ['./trial-closed-graph.component.css']
})
export class TrialClosedGraphComponent implements OnInit {


  highcharts = Highcharts;
  
  public chartOptions:any = {   
     chart: {
        type: "column"
     },
     credits: {
      enabled: false
    },
   
      title: {
        text: ''
      },

      xAxis: {
        categories: []
      },

      yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
          text: ''
        }
      },

      tooltip: {
        shared: true,
          useHTML: false,
         
          // formatter: this.formatTooltip
      },

      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },

      series: [ {
        name: 'Closed tickets',
        data: [],
        stack: 'Type A',
        color: "#43ABDB"
      }]
  };

  graph_data:any=null;
  loggedinUser: any;

  constructor(
    private router: Router,
    private plan_service: PlansService,
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('TraggetUser');
    if (!user) {
      this.router.navigate(['/home']);
    }
    let userDone = JSON.parse(user);

    this.loggedinUser = userDone;

    if (!this.loggedinUser) {
      this.router.navigate(['/home']);
    }

    this.getData();
  }

  getData(){

    let data = { user_id: this.loggedinUser?.id ? this.loggedinUser?.id: this.loggedinUser?.user_data_request_id, user_type: this.loggedinUser.account_type };

    this.plan_service.getTrialScreenGraphData(data).subscribe(response => {
      if (response && response.status) {
        if (response.data) {
          this.graph_data = response.data;
          let without_tragget:any = [];
          let with_tragget:any = [];
          let categories:any=[];
          
            if(this.graph_data.with_tragget){
              this.graph_data.with_tragget.map((item:any)=>{
                  let date = item.x && item.x.replace('-',' ');
                  if(date){
                      
                      with_tragget.push( item.y);
                      categories.push(date);
                  }
              })
              this.chartOptions.series[0].data  = with_tragget;
            }
            
            this.chartOptions.xAxis.categories = categories;

           

            this.highcharts.chart('chartContainer2', this.chartOptions);

        }
      }
    });
  }

}
