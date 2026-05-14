import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  SESSION_ACCESS_TOKEN,
  SESSION_COOKIE_PATH,
  SESSION_REFRESH_TOKEN,
} from '../constants/session-cookies';

@Injectable()
export class DIErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  /** No intentar refrescar token en estas rutas (evita bucles y “revivir” sesión al cerrar). */
  private readonly excludedUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.excludedUrls.some((url) => req.url.includes(url))) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || this.isRefreshing) {
          return throwError(() => error);
        }

        const refreshToken = this.cookieService.get(SESSION_REFRESH_TOKEN)?.trim();
        if (!refreshToken) {
          this.authService.removeTokens();
          void this.router.navigateByUrl('/login', { replaceUrl: true });
          return throwError(() => error);
        }

        this.isRefreshing = true;

        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response) => {
            const cookieOpts = { path: SESSION_COOKIE_PATH };
            this.cookieService.set(SESSION_ACCESS_TOKEN, response.accessToken, cookieOpts);
            this.cookieService.set(SESSION_REFRESH_TOKEN, response.refreshToken, cookieOpts);

            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${this.cookieService.get(SESSION_ACCESS_TOKEN)}`,
                'X-Skip-Interceptor': 'true',
              },
            });

            this.isRefreshing = false;
            return next.handle(clonedRequest);
          }),
          catchError((refreshError) => {
            this.authService.removeTokens();
            this.isRefreshing = false;
            void this.router.navigateByUrl('/login', { replaceUrl: true });
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  }
}
