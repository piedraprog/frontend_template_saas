import {
  HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

export const BYPASS_JW_TOKEN = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const cookieService = inject(CookieService);
  // TODO: AGREGAR la ip a todas las peticiones

  const newReq = req.clone({
    headers: req.headers
      .set('Platform', 'web')
      .set('Authorization', `Bearer ${cookieService.get('accessToken')}`),
  });

  if (req.context.get(BYPASS_JW_TOKEN) === true) {
    return next(req);
  }

  return next(newReq);
};
