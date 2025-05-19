import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean;
  categories = [
    'Bebidas',
    'Comida',
    'Postres',
    'Tapas',
    'Cafetería',
    'Vinos',
    'Cócteles',
    'Otros',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: any },
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.product;

    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      stock: [
        '',
        [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
      ],
      category: ['', Validators.required],
    });

    if (this.isEditMode) {
      this.productForm.patchValue(this.data.product);
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode) {
      this.apiService
        .updateProduct(this.data.product.id, productData)
        .subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error al actualizar producto', error);
            this.snackBar.open('Error al actualizar el producto', 'Cerrar', {
              duration: 3000,
            });
          },
        });
    } else {
      this.apiService.createProduct(productData).subscribe({
        next: () => {
          this.snackBar.open('Producto creado correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear producto', error);
          this.snackBar.open('Error al crear el producto', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
