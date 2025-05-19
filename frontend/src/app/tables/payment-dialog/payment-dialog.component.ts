import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class PaymentDialogComponent implements OnInit {
  paymentMethod: 'cash' | 'card' = 'cash';
  cashAmount: number = 0;
  change: number = 0;
  splitPayment: boolean = false;
  splitCount: number = 2;
  amountPerPerson: number = 0;
  loading = false;

  // Add Number function
  Number = Number;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      tableId: number;
      orderId: number;
      orderTotal: number;
      orderItems: any[];
    },
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Inicializar cashAmount con el total
    this.cashAmount = this.data.orderTotal;
    this.calculateChange();
    this.calculateSplitAmount();
  }

  calculateChange(): void {
    this.change = Math.max(0, this.cashAmount - this.data.orderTotal);
  }

  calculateSplitAmount(): void {
    if (this.splitCount > 0) {
      this.amountPerPerson = this.data.orderTotal / this.splitCount;
    } else {
      this.amountPerPerson = this.data.orderTotal;
    }
  }

  processPayment(): void {
    this.loading = true;

    const paymentData = {
      payment_method: this.paymentMethod,
      payment_amount:
        this.paymentMethod === 'cash' ? this.cashAmount : this.data.orderTotal,
    };

    this.apiService
      .payOrder(this.data.tableId, this.data.orderId, paymentData)
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.dialogRef.close({
            success: true,
            result,
            change: result.change,
          });
        },
        error: (error) => {
          console.error('Error al procesar el pago', error);
          this.snackBar.open('Error al procesar el pago', 'Cerrar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
