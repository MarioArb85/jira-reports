import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ConstantsService } from '../../services/constants.service';
import { SharedService } from "../../services/shared.service";

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-status-table',
  templateUrl: './status-table.component.html',
  styleUrls: ['./status-table.component.css']
})
export class StatusTableComponent implements OnInit, OnDestroy {
	retrievedDataSubscription: Subscription;
  retrievedStatusInUse: Subscription;

	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  jiraUrl: string = this._constant.appUrl;
  jiraResults: string;
  datasource: any[];
  showErrorMessage: boolean = true;
  statusInUse: string[];
	tableData: MatTableDataSource<any>;
  outputType: string;
  outputList: any[] = [
    {
      value: 'transitionDurationHours',
      label: 'Time (H)'
    },
    {
      value: 'transitionDurationDays',
      label: 'Time (D)'
    },
    {
      value: 'fromDateTime',
      label: 'Date (MM/DD/YYYY HH:mm:ss)'
    }
  ];
  tableHeaders: string[] = [];
  tableHeadersLabels: any[] = [];
  headersBasicList: string[] = [
  	'key',
  	'title',
  	'project',
  	'issueType',
  	'status',
  	'resolution'
  ];

  constructor(private sharedService: SharedService, private _constant: ConstantsService) { }

  ngOnInit() {
  	this.outputType = this.outputList[0].value;

  	this.retrievedDataSubscription = this.sharedService.sharedRetrievedData.subscribe(jiraData => {
      if (jiraData) {
        this.datasource = jiraData;
        this.showErrorMessage = false;
      }
  	});

    this.retrievedStatusInUse = this.sharedService.sharedStatusInUse.subscribe(statusList => {
      this.statusInUse = statusList;
    });

    if (this.datasource) {
  		this.setTableData(this.datasource, this.statusInUse);
			// document.getElementById("table-container").style.height = "calc(100% - 65px - 65px)"; 
  	}
  }

  ngOnDestroy() {
    this.retrievedDataSubscription.unsubscribe();
    this.retrievedStatusInUse.unsubscribe();
  }

  setTableData(jiraData: any[], statusList: string[]) {
  	let parseData = this.parseTableData(jiraData, this.outputType, statusList);
    this.tableData = new MatTableDataSource(parseData);
    this.tableData.paginator = this.paginator;
    this.tableData.sort = this.sort;
  	this.tableData.sortingDataAccessor = (data, header) => data[header];

    this.updateTableHeaders(jiraData, statusList);
  }

  parseTableData(jiraData: any, output: string, statusList: string[]) {
    let tableInformation = [];
    let timeLabel = 'transitionDurationHours';
    let timeDaysLabel = 'transitionDurationDays';
    let dateLabel = 'fromDateTime';

    jiraData.forEach(element => {
      let totalTime = 0;
      let totalDays = 0;
      let newElement = {
        key: element.key,
        link: this.jiraUrl + element.key,
        title: element.title,
        project: element.project,
        issueType: element.issuetype,
        status: element.status,
        resolution: element.resolution,
        total: null,
        totalDays: null
      };

      element.statusHistory.forEach(history => {
        let timeName = (history.from) ? history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1) : null;
        let timeDaysName = (history.from) ? history.from.replace(/ /g,'') + timeDaysLabel.charAt(0).toUpperCase() + timeDaysLabel.slice(1) : null;
        let dateName = (history.from) ? history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : null;

        newElement[dateName] = this.formatDate(history[dateLabel]);
        
        let roundTime = Math.round(history[timeLabel] * 100) / 100;
        if (newElement[timeName]) {
          newElement[timeName] += roundTime;
        } else {
          newElement[timeName] = roundTime;
        }

        let roundDays = Math.round(history[timeDaysLabel] * 100) / 100;
        if (newElement[timeDaysName]) {
          newElement[timeDaysName] += roundDays;
        } else {
          newElement[timeDaysName] = roundDays;
        }

        if (statusList.indexOf(history.from) >= 0) {
          totalTime += roundTime;
          totalDays += roundDays;
        }
      });

      if (output === 'transitionDurationHours' || output === 'transitionDurationHours') {
        newElement.total = Math.round(totalTime * 100) / 100;
        newElement.totalDays = Math.round(totalDays * 100) / 100;
      }

      tableInformation.push(newElement);
    });

    return tableInformation;
  }

  formatDate(statusDate: string) {
    let formatDate = new Date(statusDate);

    let formatter = new Intl.DateTimeFormat('en-us', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    return formatter.format(formatDate);
  }

  updateTableHeaders(jiraData: any, currentStatus: string[]) {
    this.tableHeaders = this.getTableHeaders(jiraData, currentStatus, this.outputType);
    this.tableHeadersLabels = this.getTableHeadersLabels(jiraData, currentStatus);
  }

  getTableHeaders(jiraData: any, currentStatus: string[], output: string) {
    let headersList = this.headersBasicList.slice();
    let statusList = [];
    let timeLabel = 'transitionDurationHours';
    let timeDaysLabel = 'transitionDurationDays';
    let dateLabel = 'fromDateTime';

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
      	if (statusList.indexOf(history.from) < 0 && currentStatus.indexOf(history.from) >= 0) {
      		statusList.push(history.from);

      		let timeName = (history.from) ? history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1) : null;
          let timeDaysName = (history.from) ? history.from.replace(/ /g,'') + timeDaysLabel.charAt(0).toUpperCase() + timeDaysLabel.slice(1) : null;
        	let dateName = (history.from) ? history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : null;

        	if (output === 'transitionDurationHours') {
            headersList.push(timeName);
          } else if(output === 'transitionDurationDays') {
            headersList.push(timeDaysName);
          } else if(output === 'fromDateTime') {
        	  headersList.push(dateName);
          } else {
            headersList.push(timeName);
            headersList.push(timeDaysName);
            headersList.push(dateName);
          }
        }
      });
    });

    return headersList;
  }

  getTableHeadersLabels(jiraData: any, currentStatus: string[]) {
    let headersList = [];

    this.headersBasicList.forEach(element => {
      headersList.push({label:element , value:element});
    });

    let labelsList = this.generateLabels(jiraData, this.outputType);
    
    headersList = headersList.concat(labelsList.start);
    headersList = headersList.concat(labelsList.end);

    return headersList;
  }

  generateLabels(jiraData: any, output: string) {
    let labels = {start: [], end:[]};
    let statusListed = [];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (statusListed.indexOf(history.from) < 0 && this.statusInUse.indexOf(history.from) >= 0) {
          switch (output) {
            case 'transitionDurationHours':
              let timeLabel = 'transitionDurationHours';
              let timeName = history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1);

              labels.start.push({
                label: history.from + ' (H)',
                value: timeName,
                class: 'small'
              });
              break;

            case 'transitionDurationDays':
              let timeDaysLabel = 'transitionDurationDays';
              let timeDaysName = history.from.replace(/ /g,'') + timeDaysLabel.charAt(0).toUpperCase() + timeDaysLabel.slice(1);

              labels.start.push({
                label: history.from + ' (D)',
                value: timeDaysName,
                class: 'small'
              });
              break;

            case 'fromDateTime':
              let dateLabel = 'fromDateTime';
              let dateName = history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

              labels.start.push({
                label: history.from,
                value: dateName,
                class: 'long'
              });
              break;
            
            default:
              let timeLabelAll = 'transitionDurationHours';
              let timeNameAll = history.from.replace(/ /g,'') + timeLabelAll.charAt(0).toUpperCase() + timeLabelAll.slice(1);

              let dateLabelAll = 'fromDateTime';
              let dateNameAll = history.from.replace(/ /g,'') + dateLabelAll.charAt(0).toUpperCase() + dateLabelAll.slice(1);

              // Labels to be added at the beginning of the final array
              labels.start.push({
                label: history.from + ' (H)',
                value: timeNameAll,
                class: 'small'
              });

              // Labels to be added at the end of the final array
              labels.end.push({
                label: history.from,
                value: dateNameAll,
                class: 'long'
              });
              break;
          }

          statusListed.push(history.from);
        }
      });
    });

    if (output === 'transitionDurationHours') {
      labels.start.unshift({
        label: 'Total (H)',
        value: 'total',
        class: 'small'
      });
    } else if (output === 'transitionDurationDays') {
      labels.start.unshift({
        label: 'Total (D)',
        value: 'totalDays',
        class: 'small'
      });
    }

    return labels;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableData.filter = filterValue.trim().toLowerCase();
  }

  updateOutput() {
    this.updateTableHeaders(this.datasource, this.statusInUse);
  }
}
