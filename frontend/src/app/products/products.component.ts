import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ProductFormComponent } from './product-form/product-form.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
  ],
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'price',
    'stock',
    'category',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  categories: string[] = [];
  categoryFilter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Add Number function to be accessed from the template
  Number = Number;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit() {
    // Asegurarnos de que el paginator y sort estén correctamente asignados
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    // Configurar el filtro para que funcione con la paginación
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Si existe un filtro de categoría, aplicarlo primero
      if (this.categoryFilter && data.category !== this.categoryFilter) {
        return false;
      }

      // Luego aplicar el filtro de texto
      const dataStr =
        data.name.toLowerCase() +
        data.category.toLowerCase() +
        data.price.toString() +
        data.stock.toString();

      return dataStr.indexOf(filter.toLowerCase()) !== -1;
    };
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // Fix the type error by explicitly casting to string array
        this.categories = [
          ...new Set(data.map((p: any) => p.category)),
        ] as string[];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByCategory(): void {
    // Reiniciar la paginación cuando se cambia el filtro
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    // Forzar actualización del filtro
    const currentFilter = this.dataSource.filter || '';
    this.dataSource.filter = '';
    setTimeout(() => {
      this.dataSource.filter = currentFilter;
    }, 0);
  }

  openProductForm(product?: any): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '500px',
      data: { product: product || null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Eliminar Producto',
        message: `¿Está seguro que desea eliminar el producto "${product.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open('Producto eliminado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error al eliminar producto', error);
            this.snackBar.open('Error al eliminar el producto', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
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
}
