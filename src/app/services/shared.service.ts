import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
	private retrievedData = new BehaviorSubject(null);
  sharedRetrievedData = this.retrievedData.asObservable();

  private requestErrorMessage = new BehaviorSubject(null);
  sharedRequestErrorMessage = this.requestErrorMessage.asObservable();

  private statusInUse = new BehaviorSubject(null);
  sharedStatusInUse = this.statusInUse.asObservable();

  private statusNotInUse = new BehaviorSubject(null);
  sharedStatusNotInUse = this.statusNotInUse.asObservable();

  constructor() { }

	setRetrievedData(jiraData: any) {
    this.retrievedData.next(jiraData);
  }

  setRequestErrorMessage(errorMessage: string) {
    this.requestErrorMessage.next(errorMessage);
  }

  setStatusInUse(statusList: any) {
    this.statusInUse.next(statusList);
  }

  setStatusNotInUse(statusList: any) {
    this.statusNotInUse.next(statusList);
  }
}
