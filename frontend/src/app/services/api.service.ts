import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Mesas
  getTables(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/tables`);
  }

  getTable(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/tables/${id}`);
  }

  createTable(tableData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/tables`, tableData);
  }

  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/tables/${id}`);
  }

  // Pedidos
  createOrder(tableId: number, items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/tables/${tableId}/order`, {
      items,
    });
  }

  updateOrder(tableId: number, orderId: number, items: any[]): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/tables/${tableId}/order/${orderId}`,
      { items }
    );
  }

  payOrder(
    tableId: number,
    orderId: number,
    paymentData: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/tables/${tableId}/order/${orderId}/pay`,
      paymentData
    );
  }

  // Productos
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/products`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/products/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/products`, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/products/${id}`);
  }

  // Administración
  getProfits(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/api/admin/profits`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return this.http.get(url);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/admin/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/admin/users`, user);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/admin/users/${id}`);
  }
}
