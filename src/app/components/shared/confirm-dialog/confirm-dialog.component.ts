import { Component, OnInit, Inject } from '@angular/core';
import { VERSION, MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
	message: string;
  confirmButtonText: string;
  cancelButtonText: string;

  constructor(
		@Inject(MAT_DIALOG_DATA) data,
  	private dialogRef: MatDialogRef<ConfirmDialogComponent>
	) { 
  		this.message = (data) ? data.message : null;	
      this.confirmButtonText = (data.buttonText) ? data.buttonText.ok : null;
      this.cancelButtonText = (data.buttonText) ? data.buttonText.cancel : null;
	}

  ngOnInit() {
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
