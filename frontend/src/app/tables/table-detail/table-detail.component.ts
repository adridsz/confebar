import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { OrderItemsDialogComponent } from '../order-items-dialog/order-items-dialog.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-table-detail',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
})
export class TableDetailComponent implements OnInit {
  tableId: number = 0;
  table: any = null;
  currentOrder: any = null;
  loading = true;

  // Add Number function to make it accessible in the template
  Number = Number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tableId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTableData();
  }

  loadTableData(): void {
    this.loading = true;
    this.apiService.getTable(this.tableId).subscribe({
      next: (data) => {
        this.table = data;
        this.currentOrder = data.current_order || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la mesa', error);
        this.snackBar.open(
          'Error al cargar los detalles de la mesa',
          'Cerrar',
          { duration: 3000 }
        );
        this.loading = false;
        this.router.navigate(['/tables']);
      },
    });
  }

  getTableStatusClass(): string {
    return this.table?.occupied ? 'table-occupied' : 'table-available';
  }

  openAddItemsDialog(): void {
    const dialogRef = this.dialog.open(OrderItemsDialogComponent, {
      width: '600px',
      data: { tableId: this.tableId, currentOrder: this.currentOrder },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTableData();
      }
    });
  }

  openPaymentDialog(): void {
    if (!this.currentOrder) {
      this.snackBar.open('No hay pedido activo para esta mesa', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '600px',
      data: {
        tableId: this.tableId,
        orderId: this.currentOrder.id,
        orderTotal: this.currentOrder.total,
        orderItems: this.currentOrder.items,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTableData();
        if (result.success) {
          this.snackBar.open('Pago procesado correctamente', 'Cerrar', {
            duration: 3000,
          });
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tables']);
  }
}
