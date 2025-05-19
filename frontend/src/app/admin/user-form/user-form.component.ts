import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class UserFormComponent {
  userForm: FormGroup;
  isEditMode: boolean;
  roles = [
    { value: 'camarero', viewValue: 'Camarero' },
    { value: 'gerente', viewValue: 'Gerente' },
    { value: 'dueño', viewValue: 'Dueño' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.user;

    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
      ],
      role: ['camarero', Validators.required],
    });

    if (this.isEditMode) {
      this.userForm.patchValue({
        username: data.user.username,
        role: data.user.role,
      });

      // Deshabilitar la edición del nombre de usuario para el admin principal
      if (data.user.username === 'admin') {
        this.userForm.get('username')?.disable();
        this.userForm.get('role')?.disable();
      }
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const userData = this.userForm.value;

    // Si no se proporcionó una contraseña en modo edición, eliminarla del objeto
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }

    if (this.isEditMode) {
      this.apiService.updateUser(this.data.user.id, userData).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar usuario', error);
          this.snackBar.open('Error al actualizar el usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    } else {
      this.apiService.createUser(userData).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
          this.snackBar.open('Error al crear el usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
