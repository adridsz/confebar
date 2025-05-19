import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../services/api.service';
import { AddTableDialogComponent } from './add-table-dialog/add-table-dialog.component';
import { RemoveTableDialogComponent } from './remove-table-dialog/remove-table-dialog.component';
import { AuthService } from '../auth/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class TablesComponent implements OnInit {
  tables: any[] = [];
  loading = true;
  cols = 4; // Número de columnas predeterminado
  hasManagerRole$: Observable<boolean>;
  currentUserRole: string | null = null;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    // Verificar si el usuario tiene rol de gerente o dueño
    this.hasManagerRole$ = this.authService.currentUser$.pipe(
      map((user) => user && (user.role === 'gerente' || user.role === 'dueño'))
    );

    // Obtener y guardar el rol actual para debug
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserRole = user?.role || null;
      console.log('Rol de usuario actual:', this.currentUserRole);
    });
  }

  ngOnInit(): void {
    this.loadTables();
    this.adjustGridCols();
    window.addEventListener('resize', () => this.adjustGridCols());
  }

  adjustGridCols(): void {
    const width = window.innerWidth;
    if (width < 600) {
      this.cols = 1;
    } else if (width < 960) {
      this.cols = 2;
    } else if (width < 1280) {
      this.cols = 3;
    } else {
      this.cols = 4;
    }
  }

  loadTables(): void {
    this.loading = true;
    this.apiService.getTables().subscribe({
      next: (data) => {
        this.tables = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar mesas', error);
        this.snackBar.open('Error al cargar las mesas', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  getTableStatusClass(table: any): string {
    return table.occupied ? 'table-occupied' : 'table-available';
  }

  openTable(tableId: number): void {
    this.router.navigate(['/tables', tableId]);
  }

  openAddTableDialog(): void {
    const dialogRef = this.dialog.open(AddTableDialogComponent, {
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.createTable(result).subscribe({
          next: () => {
            this.snackBar.open('Mesa añadida correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadTables();
          },
          error: (error) => {
            console.error('Error al añadir mesa', error);
            this.snackBar.open('Error al añadir la mesa', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openRemoveTableDialog(): void {
    // Obtener solo las mesas disponibles (no ocupadas)
    const availableTables = this.tables.filter((t) => !t.occupied);

    if (availableTables.length === 0) {
      this.snackBar.open(
        'No hay mesas disponibles para eliminar. Solo se pueden eliminar mesas que no estén ocupadas.',
        'Cerrar',
        {
          duration: 5000,
        }
      );
      return;
    }

    const dialogRef = this.dialog.open(RemoveTableDialogComponent, {
      width: '350px',
      data: { tables: availableTables },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteTable(result).subscribe({
          next: () => {
            this.snackBar.open('Mesa eliminada correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadTables();
          },
          error: (error) => {
            console.error('Error al eliminar mesa', error);
            this.snackBar.open(
              error.error?.error || 'Error al eliminar la mesa',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }
}
