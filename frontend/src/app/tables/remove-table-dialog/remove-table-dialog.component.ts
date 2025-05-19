import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-remove-table-dialog',
  templateUrl: './remove-table-dialog.component.html',
  styleUrls: ['./remove-table-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class RemoveTableDialogComponent {
  selectedTableId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<RemoveTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tables: any[] }
  ) {}

  onSubmit(): void {
    this.dialogRef.close(this.selectedTableId);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
