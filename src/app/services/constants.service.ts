import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

	constructor() { }

  readonly apiUrl: string = 'https://jira.ryanair.com:8443/rest/api/2/';
  readonly appUrl: string = 'https://jira.ryanair.com/browse/';
}
