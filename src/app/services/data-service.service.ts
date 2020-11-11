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
    // Mock data
    // return this.http.get('./assets/json/jiramock2.json');

    return this.post(`${this.jiraUrl}search`, {
      jql: query,
      maxResults: 100,
      expand: ["changelog", "names"]
    });
  }

  private post(url: string, body: any): Observable<any> {
    return this.http
      .post(url, body, { headers: this.headers, withCredentials: true })
      .pipe(map((response, any) => response))
      .pipe(catchError((error) => this.handleError(error)));
  }

  public handleError(error: any): Observable<string> {
    return throwError(error.message || 'There was an error in the server');
  }

/*
  private username = 'username';
  private pass = 'password';

  private setAuth(username: string, pass: string) {
    this.username = username;
    this.pass = pass;
    this.headers.append(
      'Authorization',
      'Basic ' + window.btoa(`${username}:${pass}`)
    );
  }
*/
}
