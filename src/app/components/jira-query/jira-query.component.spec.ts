import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraQueryComponent } from './jira-query.component';

describe('JiraQueryComponent', () => {
  let component: JiraQueryComponent;
  let fixture: ComponentFixture<JiraQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
