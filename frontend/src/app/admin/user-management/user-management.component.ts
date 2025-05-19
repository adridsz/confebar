import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserFormComponent } from '../user-form/user-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'username',
    'role',
    'created_at',
    'actions',
  ];
  dataSource: any[] = [];
  loading: boolean = true;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  openUserForm(user?: any): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: { user: user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: any): void {
    // No permitir eliminar al propio usuario
    if (user.username === 'admin') {
      this.snackBar.open(
        'No se puede eliminar el usuario administrador principal',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Está seguro que desea eliminar el usuario "${user.username}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error al eliminar usuario', error);
            this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'dueño':
        return 'role-owner';
      case 'gerente':
        return 'role-manager';
      case 'camarero':
        return 'role-waiter';
      default:
        return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'dueño':
        return 'Dueño';
      case 'gerente':
        return 'Gerente';
      case 'camarero':
        return 'Camarero';
      default:
        return role;
    }
  }
}
