import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized or forbidden (session expired), eject user
      if (error.status === 401 || error.status === 403) {
        authService.logout();

        // Decide where to redirect based on current URL path
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin') || currentPath.includes('/manager')) {
          router.navigate(['/management/login']);
        } else {
          router.navigate(['/client/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
