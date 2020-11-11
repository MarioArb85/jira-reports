import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

	constructor() { }

	readonly apiUrl: string = 'API_URL';
	// readonly apiUrl: string = 'https://jira-issues-connector.herokuapp.com/api/';
	readonly appUrl: string = 'APP_URL';
	readonly startWorkingHours: number = 9;
	readonly endWorkingHours: number = 17;
	readonly workingHours: number = 8;
}
