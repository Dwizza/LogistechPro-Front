import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // keys ديال التخزين فـ localStorage
  private ACCESS_KEY = 'accessToken';
  private REFRESH_KEY = 'refreshToken';

  constructor(private http: HttpClient) {}

  /**
   * كتسيفط email/password للباك
   * وكتستقبل accessToken/refreshToken
   * وكتخزنهم فـ localStorage (بـ tap)
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.saveTokens(res.accessToken, res.refreshToken);
        })
      );
  }

  /** كتحفظ tokens */
  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  /** كتجيب accessToken */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  /** كتجيب refreshToken */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /** كتخرج من الحساب */
  logout(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  /** واش user logged in؟ */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * كتفكّ JWT payload باش نخرجو roles
   * JWT = header.payload.signature
   * payload هو الجزء الثاني
   */
  private getPayload(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payloadPart = token.split('.')[1];
      const payloadJson = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payloadJson);
    } catch {
      return null;
    }
  }

  /** كتجيب roles من JWT */
  getRoles(): string[] {
    const payload = this.getPayload();
    return payload?.roles || [];
  }

  /** كتشيك role معين */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
}
