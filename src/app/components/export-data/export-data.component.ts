import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from "../../services/shared.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit, OnDestroy {
	fileName: string;
	jiraResults: string;
	retrievedDataSubscription: Subscription;
  retrievedStatusInUse: Subscription;

  datasource: any[];
  statusInUse: string[];
  headers: string[];
  headersLabels: any[];
  headersBasicList: string[] = [
  	'key',
  	'title',
  	'project',
  	'issueType',
  	'status',
  	'resolution'
  ];

  outputType: string;
  outputList: any[] = [
    {
      value: 'transitionDurationHours',
      label: 'Time (h)'
    },
    {
      value: 'fromDateTime',
      label: 'Date (MM/DD/YYYY HH:mm:ss)'
    },
    {
      value: 'all',
      label: 'All'
    }
  ];

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
  	this.outputType = this.outputList[0].value;

  	this.retrievedDataSubscription = this.sharedService.sharedRetrievedData.subscribe(jiraData => {
      if (jiraData) {
        this.datasource = jiraData;
      }
  	});

    this.retrievedStatusInUse = this.sharedService.sharedStatusInUse.subscribe(statusList => {
      this.statusInUse = statusList;
    });

    if (this.datasource) {
  		this.setDataToExport(this.datasource, this.statusInUse);
  	}
  }

  ngOnDestroy() {
    this.retrievedDataSubscription.unsubscribe();
    this.retrievedStatusInUse.unsubscribe();
  }

  setDataToExport(jiraData: any[], statusList: string[]) {
  	let parseData = this.parseTableData(jiraData, this.outputType, statusList);
    this.headers = this.getHeaders(jiraData, statusList, this.outputType);
    this.headersLabels = this.getHeadersLabels(jiraData, statusList);
    this.jiraResults = this.parseJiraResults(this.headersLabels, parseData);
  }

  parseTableData(jiraData: any, output: string, statusList: string[]) {
    let tableInformation = [];

    jiraData.forEach(element => {
    	let totalTime = 0;
      let newElement = {
        key: element.key,
        title: element.title,
        project: element.project,
        issueType: element.issuetype,
        status: element.status,
        resolution: element.resolution,
        total: null
      };

      element.statusHistory.forEach(history => {
        let timeLabel = 'transitionDurationHours';
        let dateLabel = 'fromDateTime';

        let timeName = (history.from) ? history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1) : null;
        let dateName = (history.from) ? history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : null;

        newElement[dateName] = this.formatDate(history[dateLabel]);

        
        let roundTime = Math.round(history[timeLabel] * 100) / 100;
        if (newElement[timeName]) {
          newElement[timeName] += roundTime;
        } else {
          newElement[timeName] = roundTime;
        }

        if (statusList.indexOf(history.from) >= 0) {
          totalTime += roundTime;
        }
      });

	    if (output === 'transitionDurationHours' || output === 'all') {
	      newElement.total = Math.round(totalTime * 100) / 100;
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

  getHeaders(jiraData: any, currentStatus: string[], output: string) {
    let headersList = this.headersBasicList.slice();
    let headerAllList = [];

    if (output === 'transitionDurationHours' || output === 'all') {
      headersList.push('total')
    }

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (headersList.indexOf(history.from) < 0 && currentStatus.indexOf(history.from) >= 0) {
          headersList.push(history.from);

          // Make each column differente and avoid duplicates
          if (this.outputType === 'all') {
            headerAllList.push(history.from + ' (h)');
          }
        }
      });
    });

    headersList = headersList.concat(headerAllList);

    return headersList;
  }

  getHeadersLabels(jiraData: any, currentStatus: string[]) {
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
          switch (this.outputType) {
            case 'transitionDurationHours':
              let timeLabel = 'transitionDurationHours';
              let timeName = history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1);

              labels.start.push({
                label: history.from + ' (h)',
                value: timeName
              });
              break;

            case 'fromDateTime':
              let dateLabel = 'fromDateTime';
              let dateName = history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

              labels.start.push({
                label: history.from,
                value: dateName
              });
              break;
            
            default:
              let timeLabelAll = 'transitionDurationHours';
              let timeNameAll = history.from.replace(/ /g,'') + timeLabelAll.charAt(0).toUpperCase() + timeLabelAll.slice(1);

              let dateLabelAll = 'fromDateTime';
              let dateNameAll = history.from.replace(/ /g,'') + dateLabelAll.charAt(0).toUpperCase() + dateLabelAll.slice(1);

              // Labels to be added at the beginning of the final array
              labels.start.push({
                label: history.from + ' (h)',
                value: timeNameAll
              });

              // Labels to be added at the end of the final array
              labels.end.push({
                label: history.from,
                value: dateNameAll
              });
              break;
          }

          statusListed.push(history.from);
        }
      });
    });

    if (output === 'transitionDurationHours' || output === 'all') {
      labels.start.unshift({
        label: 'Total (h)',
        value: 'total',
        class: 'small'
      });
    }

    return labels;
  }

  parseJiraResults(tableHeadersLabels: any[], tableData) {
    // let jiraResults = this.tableHeaders.join(',');
    let jiraResults = '';
    let headerValues = [];
    
    tableHeadersLabels.forEach(headerLabel => {
      //jiraResults += headerLabel.label + ',';
      jiraResults += `${headerLabel.label},`;
      headerValues.push(headerLabel.value);
    });  

    tableData.forEach(jiraDataRow => {
      jiraResults += '\n';
      headerValues.forEach(function(header, i) {
        if (jiraDataRow[header] && typeof jiraDataRow[header] === 'string') {
          // Remove commas
          jiraDataRow[header] = (jiraDataRow[header].indexOf(',') != -1) ? 
          	jiraDataRow[header].split(',').join('') : 
          	jiraDataRow[header];
        }
        jiraResults += (i !== 0) ? ',' : '';
        jiraResults += (jiraDataRow[header]) ? `${jiraDataRow[header]}` : '';
      });
    });

    return jiraResults;
  }

  downloadCsv(fileContent: string, fileName: string) {
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(fileContent);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    hiddenElement.click();
    this.fileName = null;
  }

  updateOutput() {
    let parseData = this.parseTableData(this.datasource, this.outputType, this.statusInUse);
    this.headers = this.getHeaders(this.datasource, this.statusInUse, this.outputType);
    this.headersLabels = this.getHeadersLabels(this.datasource, this.statusInUse);
    this.jiraResults = this.parseJiraResults(this.headersLabels, parseData);
  }
}
