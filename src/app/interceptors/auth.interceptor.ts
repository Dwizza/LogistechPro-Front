import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, Observable } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  let clonedReq = req;
  if (token) {
    clonedReq = addToken(req, token);
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return handle401Error(req, next, authService, router);
      }

      if ((error.status === 401 || error.status === 403) && (req.url.includes('/auth/login') || req.url.includes('/auth/refresh'))) {
        authService.logout();
        redirectToLogin(router);
      }

      return throwError(() => error);
    })
  );
};

const addToken = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

const redirectToLogin = (router: Router) => {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/admin') || currentPath.includes('/manager')) {
    router.navigate(['/management/login']);
  } else {
    router.navigate(['/client/login']);
  }
}

const handle401Error = (req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService, router: Router): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        const newToken = res.accessToken || res.access_token;
        refreshTokenSubject.next(newToken);
        return next(addToken(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        redirectToLogin(router);
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(addToken(req, jwt!));
      })
    );
  }
};
