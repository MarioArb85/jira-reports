import { Component, OnInit, OnDestroy} from '@angular/core';
import { GoogleChartInterface } from "ng2-google-charts/google-charts-interfaces";
import { SharedService } from "../../services/shared.service";

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-status-bar-chart',
  templateUrl: './status-bar-chart.component.html',
  styleUrls: ['./status-bar-chart.component.css']
})
export class StatusBarChartComponent implements OnInit, OnDestroy {
  retrievedDataSubscription: Subscription;
  retrievedStatusInUse: Subscription;
  datasource: any[];
  statusInUse: string[];

  chartData: GoogleChartInterface = {
    chartType: "ComboChart"
  };

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.retrievedDataSubscription = this.sharedService.sharedRetrievedData.subscribe(jiraData => {
      if (jiraData) {
        this.datasource = this.pretifyJiraData(jiraData);
      }
  	});

    this.retrievedStatusInUse = this.sharedService.sharedStatusInUse.subscribe(statusList => {
      this.statusInUse = statusList;
    });

    if (this.datasource) {
      console.log(this.datasource);
      this.chartData.options = this.getChartOptions();
      this.chartData.dataTable = this.parseSource();
    }
  }

  ngOnDestroy() {
    this.retrievedDataSubscription.unsubscribe();
    this.retrievedStatusInUse.unsubscribe();
  }

  private pretifyJiraData(jiraData: any) {
    let parseData = [];

    jiraData.forEach(element => {
      let item = {
        key: element.key,
        title: element.title,
        status: element.status,
        data: {}
      };

      element.statusHistory.forEach(history => {
        item.data[history.from] = history.transitionDurationDays;
      });

      parseData.push(item);
    });

    return parseData;
  }

  private getChartOptions() {
    // -60 due to Container padding 
    let canvasWidth = (document.getElementById("viewContainer").clientWidth) - 60;
    let canvasHeight = (document.getElementById("viewContainer").clientHeight) - 30;
    let chartAreaWidth = canvasWidth * .75;
    let chartAreaHeight = canvasHeight * .8;

    return {
      vAxis: { 
        title: 'Time (in days)' 
      },
      hAxis: { 
        title: 'Status' 
      },
      seriesType: 'bars',
      series: { 0: { type: 'line' } },
      height: canvasHeight,
      width: canvasWidth,
      chartArea: {
        width: chartAreaWidth,
        height: chartAreaHeight
      }
    };
  }

  private parseSource(): GoogleChartInterface["dataTable"] {
    let res: GoogleChartInterface["dataTable"] = [];

    let header: Array<any> = [];
    header.push("Keys");
    header.push("Average");
    this.datasource.forEach(element => {
      header.push(element.key);
    });
    res.push(header);

    this.statusInUse.forEach(_status => {
      let row: Array<any> = [];
      let total: number = 0;
      let control: number = 0;

      this.datasource.forEach(_dataSource => {
        row.push(_dataSource.data[_status] || 0);
        total += _dataSource.data[_status] || 0;
        control += _dataSource.data[_status] ? 1 : 0;
      });
      // Add Average in the beggining of the Array
      row.unshift(total / control);
      row.unshift(_status);

      res.push(row);
    });

    return res;
  }
}


