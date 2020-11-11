import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstantsService } from './constants.service';

import { Observable, throwError } from "rxjs";
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: "root"
})
export class DataService {
  private headers: HttpHeaders = new HttpHeaders({'Content-type': 'application/json'});
  private jiraUrl: string = this._constant.apiUrl;

  constructor(private http: HttpClient, private _constant: ConstantsService) {}

  public getDaysPerStatus(query: string): Observable<any> {
    const nodeURL = this.jiraUrl + 'get-jira-issues';
    const sendParams = {
      jql: query,
      maxResults: 100,
      expand: [
        'changelog', 
        'names'
      ],
      fields: [
        'key',
        'summary',
        'created',
        'updated',
        'issuetype',
        'project',
        'customfield_10002',  // Story points
        'customfield_10005',  //Sprints
        'status',
        'resolution'
      ]
    };

    // Mock data
    // return this.http.get('./assets/json/jiramock2.json');

    return this.post(nodeURL, sendParams);
  }

  private post(url: string, body: any): Observable<any> {
    return this.http
      .post(url, body, { headers: this.headers})
      .pipe(map((response, any) => response))
      .pipe(catchError((error) => this.handleError(error)));
  }

  public handleError(error: any): Observable<string> {
    return throwError(error);
  }
}
