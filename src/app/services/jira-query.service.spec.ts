import { TestBed } from '@angular/core/testing';

import { JiraQueryService } from './jira-query.service';

describe('JiraQueryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JiraQueryService = TestBed.get(JiraQueryService);
    expect(service).toBeTruthy();
  });
});
