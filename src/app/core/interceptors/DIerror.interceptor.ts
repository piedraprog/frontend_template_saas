import { Injectable } from '@angular/core';
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

@Injectable()
export class DIErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false; // Variable para evitar múltiples refresh
  private readonly excludedUrls = ['/auth/login', '/auth/register'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Comprobar si la URL está en la lista de rutas excluidas
    if (this.excludedUrls.some((url) => req.url.includes(url))) {
      return next.handle(req); // Si está en las excluidas, continuar sin interceptar
    }

    // Verificar si la solicitud ya tiene el token actualizado (para evitar ciclos)
    if (
      req.headers.has('Authorization') &&
      req.headers.get('Authorization')?.startsWith('Bearer ')
    ) {
      // Verificar si ya hemos manejado la solicitud
      if (req.headers.has('X-Skip-Interceptor')) {
        return next.handle(req); // Pasar la solicitud sin interceptarla
      }
    }
    console.log('interceptor');
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          // Si la solicitud falla con un 401 y no estamos en proceso de refrescar
          this.isRefreshing = true; // Establecer el flag de refresh

          const refreshToken = this.cookieService.get('refreshToken');
          return this.authService.refreshToken(refreshToken).pipe(
            switchMap((response) => {
              // Refresco exitoso, actualizar el token
              this.cookieService.set('accessToken', response.accessToken);
              this.cookieService.set('refreshToken', response.refreshToken);

              // Clonar la solicitud original con el nuevo token
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${this.cookieService.get('accessToken')}`,
                  'X-Skip-Interceptor': 'true', // Añadir el flag para evitar el loop
                },
              });

              this.isRefreshing = false; // Resetear el flag de refresh

              return next.handle(clonedRequest); // Reintentar la solicitud con el nuevo token
            }),
            catchError((refreshError) => {
              // El refresh falló, limpiar la sesión y redirigir
              this.authService.removeTokens();
              this.isRefreshing = false; // Resetear el flag de refresh
              this.router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
        } else {
          return throwError(() => error);
        }
      }),
    );
  }
}
