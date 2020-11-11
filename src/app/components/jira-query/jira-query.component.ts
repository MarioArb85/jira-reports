import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from "../../services/shared.service";
import { DataService } from "../../services/data-service.service";
import { JiraQueryService } from "../../services/jira-query.service";
import { ConstantsService } from '../../services/constants.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

import { JiraQuery } from '../../classes/jiraQuery';

import { Subscription  } from 'rxjs';

@Component({
  selector: 'app-jira-query',
  templateUrl: './jira-query.component.html',
  styleUrls: ['./jira-query.component.css']
})
export class JiraQueryComponent implements OnInit, OnDestroy {
	retrievedDataSubscription: Subscription;
	retrievedRequestErrorMessage: Subscription;
  retrievedRequestErrorList: Subscription;
	retrievedgetDaysPerStatus: Subscription;
	queryString: string;
	errorMessage: string;
  errorList: string[];
	dataRetrievedMessage: string;
  queryName: string;
  jiraQueries: JiraQuery[];
  beginingOfWorkingHours = this._constant.startWorkingHours;
  endOfWorkingHours = this._constant.endWorkingHours;
  dayWorkingHours = this._constant.workingHours;

  constructor(
    private sharedService: SharedService, 
    private dataService: DataService,
    private jiraQueryService: JiraQueryService,
    public dialog: MatDialog,
    private _constant: ConstantsService) { }

  ngOnInit() {
  	let dataRetrieved:[];
    this.jiraQueries = this.jiraQueryService.getJiraQueries();
  	
  	this.retrievedDataSubscription = this.sharedService.sharedRetrievedData.subscribe(jiraData => {
  		dataRetrieved = jiraData;
  	});

  	// Check if previous query has been done
  	if (dataRetrieved) {
  		this.dataRetrievedMessage = `${dataRetrieved.length} issues retrieved`
		} else {
			this.retrievedRequestErrorMessage = this.sharedService.sharedRequestErrorMessage.subscribe(errorMessage => {
				this.errorMessage = (errorMessage) ? errorMessage : null;
			});
      this.retrievedRequestErrorList =  this.sharedService.sharedRequestErrorList.subscribe(errorList => {
        this.errorList = (errorList) ? errorList : []
      });
		}
  }

  ngOnDestroy() {
  	this.retrievedDataSubscription.unsubscribe();
  	if (this.retrievedRequestErrorMessage) {
  		this.retrievedRequestErrorMessage.unsubscribe();
  	}
    if (this.retrievedRequestErrorList) {
      this.retrievedRequestErrorList.unsubscribe();
    }
  	if (this.retrievedgetDaysPerStatus) {
  		this.retrievedgetDaysPerStatus.unsubscribe();
  	}
  }

  getDataFromJIRA(queryString: string) {
  	this.dataRetrievedMessage, this.errorMessage = null;

    this.retrievedgetDaysPerStatus = this.dataService.getDaysPerStatus(queryString).subscribe(jiraData => {
      this.dataRetrievedMessage = `${jiraData.issues.length} issues retrieved.`
      this.errorMessage = null;

      let exportJiraData = this.formatJiraData(jiraData.issues);
      let statusList = this.getStatus(exportJiraData);

      this.sharedService.setRetrievedData(exportJiraData);
      this.sharedService.setStatusInUse(statusList);
    }, errorMessage => {
    	this.dataRetrievedMessage = null;
      this.errorMessage = errorMessage.message;
      this.errorList = JSON.parse(errorMessage.error).body.errorMessages || [];
      this.sharedService.setRequestErrorMessage(this.errorMessage);
      this.sharedService.setRequestErrorList(this.errorList);
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

  saveQuery(name: string, query: string): void {
    this.jiraQueryService.addJiraQuery(name, query);
    this.jiraQueries = this.jiraQueryService.getJiraQueries();
    this.queryName = null;
  }

  deleteQuery(queryId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete this query?',
        buttonText: {
          ok: 'Delete',
          cancel: 'Cancel'
        }
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.jiraQueryService.removeJiraQuery(queryId);
        this.jiraQueries = this.jiraQueryService.getJiraQueries();
      }
    });
  }
}
