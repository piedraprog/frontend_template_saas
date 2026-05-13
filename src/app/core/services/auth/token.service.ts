import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

/** Payload mínimo del access JWT (auth Nest / passport-jwt). */
export interface AccessTokenPayload {
  sub: string;
  email?: string;
  companyId?: string;
  roles?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly cookieService = inject(CookieService);

  getAccessToken(): string {
    return this.cookieService.get('accessToken') ?? '';
  }

  private parsePayload(): AccessTokenPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const json = globalThis.atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as AccessTokenPayload;
    } catch {
      return null;
    }
  }

  getUserId(): string | undefined {
    return this.parsePayload()?.sub;
  }

  getCompanyId(): string | undefined {
    return this.parsePayload()?.companyId;
  }
}
