import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from "../../services/shared.service";
import { DataService } from "../../services/data-service.service";
import { JiraQueryService } from "../../services/jira-query.service";

import { Subscription  } from 'rxjs';

@Component({
  selector: 'app-jira-query',
  templateUrl: './jira-query.component.html',
  styleUrls: ['./jira-query.component.css']
})
export class JiraQueryComponent implements OnInit, OnDestroy {
	retrievedDataSubscription: Subscription;
	retrievedRequestErrorMessage: Subscription;
	retrievedgetDaysPerStatus: Subscription;
	queryString: string;
	errorMessage: string;
	dataRetrievedMessage: string;

  constructor(
    private sharedService: SharedService, 
    private dataService: DataService,
    private jiraQueryService: JiraQueryService) { }

  ngOnInit() {
  	let dataRetrieved:[];
  	this.queryString = 'project = OPREP AND fixVersion in ("OPS Reports 1.2", "OPS Reports 1.3", "OPS Reports 1.4", "OPS Reports 1.5")';
  	
  	this.retrievedDataSubscription = this.sharedService.sharedRetrievedData.subscribe(jiraData => {
  		dataRetrieved = jiraData;
  	});

  	// Check if previous query has been done
  	if (dataRetrieved) {
  		this.dataRetrievedMessage = `${dataRetrieved.length} issues retrieved`
		} else {
			this.retrievedRequestErrorMessage = this.sharedService.sharedRequestErrorMessage.subscribe(errorMessage => {
				this.errorMessage = (errorMessage) ? errorMessage : null
			});
		}
  }

  ngOnDestroy() {
  	this.retrievedDataSubscription.unsubscribe();
  	if (this.retrievedRequestErrorMessage) {
  		this.retrievedRequestErrorMessage.unsubscribe();
  	}
  	if (this.retrievedgetDaysPerStatus) {
  		this.retrievedgetDaysPerStatus.unsubscribe();
  	}
  }

  getDataFromJIRA(querString: string) {
  	this.dataRetrievedMessage, this.errorMessage = null;

    this.retrievedgetDaysPerStatus = this.dataService.getDaysPerStatus(querString).subscribe(jiraData => {
      this.dataRetrievedMessage = `${jiraData.issues.length} issues retrieved.`
      this.errorMessage = null;

      let exportJiraData = this.formatJiraData(jiraData.issues);
      let statusList = this.getStatus(exportJiraData);

      this.sharedService.setRetrievedData(exportJiraData);
      this.sharedService.setStatusInUse(statusList);
    }, errorMessage => {
    	this.dataRetrievedMessage = null;
      this.errorMessage = errorMessage;
      this.sharedService.setRequestErrorMessage(errorMessage);
    });
  }

  formatJiraData(jiraData: any){
  	const fomattedJiraData: Array<any> = [];

  	jiraData.forEach(issue => {
  		fomattedJiraData.push({
  			key: issue.key,
        title: issue.fields.summary,
        created: issue.fields.created,
        updated: issue.fields.updated,
        issuetype: issue.fields.issuetype.name,
        project: issue.fields.project.name,
        estimate: issue.fields.customfield_10002,
        status: issue.fields.status.name,
        statusId: issue.fields.status.id,
        resolution: (issue.fields.resolution)
          ? issue.fields.resolution.name
          : null,
        statusHistory: this.getStatusHIstory(issue)
  		});
  	});

  	return fomattedJiraData;
  }

  getStatusHIstory(jiraIssue: any) {
    let filteredStatusHistory: Array<any> = [];
    let statusHistory: Array<any> = [];

    if (jiraIssue.changelog && jiraIssue.changelog.histories) {
      jiraIssue.changelog.histories.forEach(history => {
        let statusHistoryItem = history.items.filter (historyItem => historyItem.field === "status");
        if (statusHistoryItem.length > 0) {
          statusHistoryItem.created = history.created;
          filteredStatusHistory.push(statusHistoryItem);
        }
      });
    }
    
    filteredStatusHistory.forEach(function(status, i) {
			const fromDt =
        statusHistory.length > 0
          ? statusHistory[statusHistory.length - 1].toDateTime
          : jiraIssue.fields.created;

			let sh = {
        fromDateTime: fromDt,
        toDateTime: status.created,
        transitionDurationHours: 0,
        transitionDurationDays: 0,
        from: (status[0]["fromString"]) ? status[0]["fromString"] : null,
        to: (status[0]["toString"]) ? status[0]["toString"] : null,
      };

      sh.transitionDurationHours =
        Math.abs(
          new Date(sh.toDateTime).getTime() -
          new Date(sh.fromDateTime).getTime()
        ) / (1000 * 60 * 60);

      sh.transitionDurationDays =
        Math.abs(
          new Date(sh.toDateTime).getTime() -
          new Date(sh.fromDateTime).getTime()
        ) / (1000 * 60 * 60 * 24);
      
      statusHistory.push(sh);

      console.log('***********************');
      console.log(status);
      console.log(sh);
      console.log(sh.transitionDurationHours);
      console.log(sh.transitionDurationDays);

      // Remove it?
/*
      if (i === filteredStatusHistory.length - 1) {
        const shLast = {
          fromDateTime: status.created,
          toDateTime: Date.now(),
          transitionDurationHours: 0,
          transitionDurationDays: 0,
          from: (status[0]["fromString"]) ? status[0]["fromString"] : '',
          to: null
        };
        shLast.transitionDurationHours =
          Math.abs(
            new Date(shLast.toDateTime).getTime() -
              new Date(shLast.fromDateTime).getTime()
          ) /
          (1000 * 60 * 60);
        shLast.transitionDurationDays =
          Math.abs(
            new Date(shLast.toDateTime).getTime() -
              new Date(shLast.fromDateTime).getTime()
          ) / 86400000;

        console.log(Date.now());
        console.log(shLast);

        statusHistory.push(shLast);
      }
*/
    });
    return statusHistory;
  }

  private getStatus(jiraData: any) {
    let statusList = [];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (statusList.indexOf(history.from) < 0) {
          statusList.push(history.from);
        }
      });
    });

    return statusList;
  }
}