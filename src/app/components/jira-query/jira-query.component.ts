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
        statusHistory: this.getStatusHIstory(issue),
        sprints: this.getSprints(issue)
  		});
  	});

  	return fomattedJiraData;
  }

  getSprints(jiraIssue: any) {
    let sprintsList = [];

    if (jiraIssue.fields.customfield_10005) {
      jiraIssue.fields.customfield_10005.forEach(sprint => {
        let parseSprintData = sprint.match(/\[(.*)\]/)[1].split(',').reduce((acc, pair) => {
          const [key, value] = pair.split('='); 
          acc[key] = value; 
          return acc;
        }, {});
        sprintsList.push({
          name: parseSprintData.name,
          goal: parseSprintData.goal,
          state: parseSprintData.state,
          startDate: parseSprintData.startDate,
          endDate: parseSprintData.endDate,
          completeDate: parseSprintData.completeDate
        });
      });
    }
    return sprintsList;
  }

  getStatusHIstory(jiraIssue: any) {
    let filteredStatusHistory: Array<any> = [];
    let statusHistory: Array<any> = [];

    if (jiraIssue.changelog && jiraIssue.changelog.histories) {
      jiraIssue.changelog.histories.forEach(history => {
        let statusHistoryItem = history.items.filter (historyItem => historyItem.field === "status");
        if (statusHistoryItem.length > 0) {
          statusHistoryItem.created = history.created;
          filteredStatusHistory.push({
            fromString: statusHistoryItem[0].fromString,
            toString: statusHistoryItem[0].toString,
            created: history.created
          });
        }
      });
    }
    
    filteredStatusHistory.forEach(status => {
			const fromDt =
        statusHistory.length > 0
          ? statusHistory[statusHistory.length - 1].toDateTime
          : jiraIssue.fields.created;

			let sh = {
        fromDateTime: fromDt,
        toDateTime: status.created,
        transitionDurationHours: 0,
        transitionDurationDays: 0,
        from: (status.fromString) ? status.fromString : null,
        to: (status.toString) ? status.toString : null,
      };

      sh.transitionDurationHours = this.getHoursNoWeekends(sh.toDateTime, sh.fromDateTime);
      sh.transitionDurationDays = sh.transitionDurationHours / this.dayWorkingHours;

      statusHistory.push(sh);
    });
    return statusHistory;
  }

  private getHoursNoWeekends(toDateTime, fromDateTime) {
    //Generate new date for iteration. Set start working time to 8am
    let iterateFromDate = new Date(fromDateTime);
    // beginingOfWorkingHours - 1 to give some margin
    iterateFromDate.setHours(this.beginingOfWorkingHours - 1);
    iterateFromDate.setMinutes(0);
    iterateFromDate.setSeconds(0);

    let weekendHours = 0;
    let workingHours = 0;
    
    //Check weekendDays
    do {
      if (iterateFromDate.getDay() !== 6 && iterateFromDate.getDay() !== 0) {
        workingHours += this.getWorkingHours(iterateFromDate, toDateTime, fromDateTime);
        //console.log('workingHours added: ' + this.getWorkingHours(iterateFromDate, toDateTime, fromDateTime));
        //console.log('Total workingHours: ' + workingHours);
      }

      //Count number of holidays
      /* TO DO*/

      iterateFromDate.setDate(iterateFromDate.getDate() + 1);
    } while ( iterateFromDate <= new Date(toDateTime))

    return workingHours;
  }

  private getWorkingHours(iterateFromDate, toDateTime, fromDateTime) {
    // Get MM/DD for comparations
    let parseIterateFromDate =  new Date(iterateFromDate).getMonth() + '/' +  new Date(iterateFromDate).getDate();
    let parseToDateTime =  new Date(toDateTime).getMonth() + '/' +  new Date(toDateTime).getDate();
    let parseFromDateTime =  new Date(fromDateTime).getMonth() + '/' +  new Date(fromDateTime).getDate();

    if(parseToDateTime === parseFromDateTime) {
      return this.getTotalHours(toDateTime, fromDateTime);

    } else if (parseFromDateTime === parseIterateFromDate) {
      // First day of itearation

      // Working hours 8h-18h
      let endOfFirstDay = new Date(fromDateTime);
      // endOfWorkingHours + 1 to give some margin
      endOfFirstDay.setHours(this.endOfWorkingHours + 1);
      endOfFirstDay.setMinutes(0);
      endOfFirstDay.setSeconds(0);
      return (new Date(fromDateTime) > new Date(endOfFirstDay)) ? 
        0 :
        this.getTotalHours(endOfFirstDay, fromDateTime);

    } else if (parseToDateTime === parseIterateFromDate) {
      // Last day of itearation
      return (new Date(iterateFromDate) > new Date(toDateTime)) ? 
        0 :
        this.getTotalHours(toDateTime, iterateFromDate);
    } else {
      // Intermediate days of itearation
      return this.dayWorkingHours;
    }

    return 0;
  }

  private getTotalHours(toDateTime, fromDateTime) {
    return Math.abs(
      new Date(toDateTime).getTime() -
      new Date(fromDateTime).getTime()
      ) / (1000 * 60 * 60);
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
