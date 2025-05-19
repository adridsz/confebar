import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class AdminDashboardComponent implements OnInit {
  loading: boolean = false;
  startDate: Date = new Date();
  endDate: Date = new Date();
  profitData: any = null;

  // Para conversión de números en plantilla
  Number = Number;

  constructor(private apiService: ApiService) {
    // Establecer fechas predeterminadas: último mes
    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 1);
    this.endDate = new Date();
  }

  ngOnInit(): void {
    this.loadProfitData();
  }

  loadProfitData(): void {
    this.loading = true;

    // Formatear fechas a yyyy-mm-dd
    const formattedStartDate = this.formatDate(this.startDate);
    const formattedEndDate = this.formatDate(this.endDate);

    this.apiService.getProfits(formattedStartDate, formattedEndDate).subscribe({
      next: (data) => {
        this.profitData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos de ganancias', error);
        this.loading = false;
      },
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFormattedDates(): string {
    return `${this.formatDate(this.startDate)} al ${this.formatDate(
      this.endDate
    )}`;
  }
}
