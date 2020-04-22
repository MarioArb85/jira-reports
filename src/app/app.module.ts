import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ChartsModule } from "ng2-charts";
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { ConstantsService } from "./services/constants.service";
import { DataService } from "./services/data-service.service";
import { JiraQueryService } from "./services/jira-query.service";
import { LoaderService } from './services/loader.service';
import { SharedService } from './services/shared.service';

import { LoaderInterceptor } from './interceptors/loader.interceptor';

import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { LoaderComponent } from './components/shared/loader/loader.component';

import { ExportDataComponent, } from './components/export-data/export-data.component';
import { JiraQueryComponent } from './components/jira-query/jira-query.component';
import { StatusBarChartComponent } from "./components/status-bar-chart/status-bar-chart.component";
import { StatusListComponent } from './components/status-list/status-list.component';
import { StatusTableComponent } from './components/status-table/status-table.component';

import { Routes, RouterModule } from "@angular/router";
import { Ng2GoogleChartsModule } from "ng2-google-charts";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';


const appRoutes: Routes = [
  { path: "export-data", component: ExportDataComponent },
  { path: "jira-query", component: JiraQueryComponent },
  { path: "status-bar-chart", component: StatusBarChartComponent },
  { path: "status-list", component: StatusListComponent },
  { path: "status-table", component: StatusTableComponent },
  { path: "", redirectTo: "jira-query", pathMatch: "full" },
  { path: "**", redirectTo: "jira-query" }
];

@NgModule({
  declarations: [    
    AppComponent,
    ConfirmDialogComponent,
    ExportDataComponent,
    JiraQueryComponent,
    LoaderComponent,
    StatusBarChartComponent,
    StatusListComponent,
    StatusTableComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule,
    ChartsModule,
    CommonModule,
    FormsModule,
    Ng2GoogleChartsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule
  ],
  providers: [
    ConstantsService,
    DataService,
    JiraQueryService,
    LoaderService,
    SharedService,
    { 
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
