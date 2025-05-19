import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-order-items-dialog',
  templateUrl: './order-items-dialog.component.html',
  styleUrls: ['./order-items-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
})
export class OrderItemsDialogComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedItems: any[] = [];
  loading = true;
  categories: string[] = [];
  selectedCategory: string = '';

  // Para conversión de tipos en plantilla
  Number = Number;

  constructor(
    public dialogRef: MatDialogRef<OrderItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { tableId: number; currentOrder: any },
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        // Extraer categorías únicas
        this.categories = [
          ...new Set(data.map((p: any) => p.category)),
        ] as string[];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  filterByCategory(): void {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(
        (p) => p.category === this.selectedCategory
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  getStockClass(stock: number): string {
    if (stock <= 0) {
      return 'out-of-stock';
    } else if (stock < 5) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  }

  addProductToOrder(product: any): void {
    if (product.stock <= 0) {
      this.snackBar.open('Este producto está agotado', 'Cerrar', {
        duration: 2000,
      });
      return;
    }

    const existingItemIndex = this.selectedItems.findIndex(
      (item) => item.product_id === product.id
    );

    if (existingItemIndex >= 0) {
      // El producto ya está en la lista, incrementar cantidad
      if (this.selectedItems[existingItemIndex].quantity < product.stock) {
        this.selectedItems[existingItemIndex].quantity++;
        this.selectedItems[existingItemIndex].subtotal =
          this.selectedItems[existingItemIndex].quantity * product.price;
      } else {
        this.snackBar.open(
          'No hay más unidades disponibles de este producto',
          'Cerrar',
          { duration: 2000 }
        );
      }
    } else {
      // Añadir nuevo producto a la lista
      this.selectedItems.push({
        product_id: product.id,
        product: product,
        quantity: 1,
        subtotal: product.price,
      });
    }
  }

  getProductQuantity(productId: number): number {
    const item = this.selectedItems.find(
      (item) => item.product_id === productId
    );
    return item ? item.quantity : 0;
  }

  increaseQuantity(index: number): void {
    const item = this.selectedItems[index];
    const product = item.product;

    if (item.quantity < product.stock) {
      item.quantity++;
      item.subtotal = item.quantity * product.price;
    } else {
      this.snackBar.open(
        'No hay más unidades disponibles de este producto',
        'Cerrar',
        { duration: 2000 }
      );
    }
  }

  decreaseQuantity(index: number): void {
    const item = this.selectedItems[index];

    if (item.quantity > 1) {
      item.quantity--;
      item.subtotal = item.quantity * item.product.price;
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number): void {
    this.selectedItems.splice(index, 1);
  }

  getTotal(): number {
    return this.selectedItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );
  }

  onSubmit(): void {
    if (this.selectedItems.length === 0) {
      this.snackBar.open('Debe añadir al menos un producto', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const items = this.selectedItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    this.loading = true;

    if (this.data.currentOrder) {
      // Actualizar pedido existente
      this.apiService
        .updateOrder(this.data.tableId, this.data.currentOrder.id, items)
        .subscribe({
          next: (result) => {
            this.loading = false;
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error al actualizar pedido', error);
            this.snackBar.open('Error al actualizar el pedido', 'Cerrar', {
              duration: 3000,
            });
            this.loading = false;
          },
        });
    } else {
      // Crear nuevo pedido
      this.apiService.createOrder(this.data.tableId, items).subscribe({
        next: (result) => {
          this.loading = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error al crear pedido', error);
          this.snackBar.open('Error al crear el pedido', 'Cerrar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
