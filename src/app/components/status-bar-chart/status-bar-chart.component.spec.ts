import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBarChartComponent } from './status-bar-chart.component';

describe('StatusBarChartComponent', () => {
  let component: StatusBarChartComponent;
  let fixture: ComponentFixture<StatusBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
