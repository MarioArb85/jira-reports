import { Injectable } from '@angular/core';
import { JiraQuery } from '../classes/jiraQuery';

@Injectable({
  providedIn: 'root'
})
export class JiraQueryService {
	private nextId: number;

  constructor() {
  	let jiraQueries = this.getJiraQueries();

  	if (jiraQueries.length === 0) {
  		this.nextId = 0;
  	} else {
  		let maxId = jiraQueries[jiraQueries.length - 1].id;
  		this.nextId = maxId + 1;
  	}
  }

  public addJiraQuery(name: string, query: string): void {
  	let newJiraQuery = new JiraQuery(this.nextId, name, query);
  	let jiraQueries = this.getJiraQueries();
  	jiraQueries.push(newJiraQuery);

  	this.setLocalStorageJiraQueries(jiraQueries);
  	this.nextId++;
  }

  public getJiraQueries(): JiraQuery[] {
  	let localStorageItem = JSON.parse(localStorage.getItem('jiraQueries'));
  	return localStorageItem === null ? [] : localStorageItem.jiraQueries;
  }

  public removeJiraQuery(id: number): void {
  	let jiraQueries = this.getJiraQueries();
  	jiraQueries = jiraQueries.filter((jiraQuery) => jiraQuery.id != id);
  	this.setLocalStorageJiraQueries(jiraQueries);
  }

  public setLocalStorageJiraQueries(jiraQueries: JiraQuery[]): void {
  	localStorage.setItem('jiraQueries', JSON.stringify({ jiraQueries: jiraQueries }));
  }
}
