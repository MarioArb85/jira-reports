import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from "../../services/shared.service";

import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Subscription  } from 'rxjs';

@Component({
  selector: 'app-status-list',
  templateUrl: './status-list.component.html',
  styleUrls: ['./status-list.component.css']
})
export class StatusListComponent implements OnInit, OnDestroy {
	retrievedStatusInUse: Subscription;
	retrievedStatusNotInUse: Subscription;
	usedStatus: any[];
  notUsedStatus: any[];

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.retrievedStatusInUse = this.sharedService.sharedStatusInUse.subscribe(statusList => {
      this.usedStatus = (statusList) ? statusList : [];
    });

    this.retrievedStatusNotInUse = this.sharedService.sharedStatusNotInUse.subscribe(statusList => {
      this.notUsedStatus = (statusList) ? statusList : [];
    });
  }

	ngOnDestroy() {
		this.retrievedStatusInUse.unsubscribe();
		this.retrievedStatusNotInUse.unsubscribe();
	}

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }

    this.sharedService.setStatusInUse(this.usedStatus);
    this.sharedService.setStatusNotInUse(this.notUsedStatus);
  }
}
