import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private jwtHelper = new JwtHelperService();
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  private loadUser(): void {
    const token = localStorage.getItem('token');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next({
        id: decodedToken.id,
        username: decodedToken.username,
        role: decodedToken.role,
      });
    } else {
      this.currentUserSubject.next(null);
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);

            this.currentUserSubject.next(response.user);
          }
        }),
        map((response) => !!response.token),
        catchError((error) => {
          console.error('Error de login:', error);
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && allowedRoles.includes(user.role);
  }
}
