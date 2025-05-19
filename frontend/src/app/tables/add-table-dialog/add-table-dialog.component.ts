import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-table-dialog',
  templateUrl: './add-table-dialog.component.html',
  styleUrls: ['./add-table-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
})
export class AddTableDialogComponent {
  table = {
    number: '',
    capacity: 4,
  };

  capacityOptions = [2, 4, 6, 8, 10];

  constructor(public dialogRef: MatDialogRef<AddTableDialogComponent>) {}

  onSubmit(): void {
    this.dialogRef.close(this.table);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
