import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

// Class-based interceptor (for module-based apps)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // No interceptamos la solicitud de login
    if (request.url.includes('/login')) {
      return next.handle(request);
    }

    const token = this.authService.getToken();

    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`),
      });

      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }
}

// Function-based interceptor (for standalone apps)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip login requests
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  console.log('Function interceptor token:', token);

  if (token) {
    // Clone the request with the Authorization header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    console.log('Authorization:', clonedReq.headers.get('Authorization'));

    // Return the modified request with error handling
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle token expiration - needs a way to access services
          console.log('Token expired or invalid');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
