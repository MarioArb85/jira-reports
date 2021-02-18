import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

	constructor() { }

	readonly apiUrl: string = 'API_URL';
	// Example: working locally with node API REST
	// readonly apiUrl: string = 'http://localhost:5000/api/';
	readonly appUrl: string = 'APP_URL';
	readonly startWorkingHours: number = 9;
	readonly endWorkingHours: number = 17;
	readonly workingHours: number = 8;
}
