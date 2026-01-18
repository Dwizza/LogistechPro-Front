import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private ACCESS_KEY = 'accessToken';
  private REFRESH_KEY = 'refreshToken';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          const access = res.accessToken || res.access_token;
          const refresh = res.refreshToken || res.refresh_token;
          if (access && refresh) {
            this.saveTokens(access, refresh);
          }
        })
      );
  }

  loginWithRoleCheck(email: string, password: string, allowedRoles: string[]): Observable<LoginResponse> {
    return this.login(email, password).pipe(
      tap(() => {
        const roles = this.getRoles();
        const hasPermission = allowedRoles.some(role => roles.includes(role));
        if (!hasPermission) {
          this.logout();
          throw { error: { message: 'Access denied for this login type.' } };
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && token !== 'undefined' && token !== 'null';
  }

  private getPayload(): any | null {
    const token = this.getAccessToken();
    if (!token || token === 'undefined' || token === 'null') return null;

    try {
      const payloadPart = token.split('.')[1];
      const payloadJson = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const payload = this.getPayload();
    if (!payload) return [];

    const roles = payload.roles || payload.authorities || payload.role || [];

    if (Array.isArray(roles)) {
      return roles.map(r => typeof r === 'string' ? r : (r.authority || r.name || JSON.stringify(r)));
    }

    if (typeof roles === 'string') {
      return [roles];
    }

    return [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
