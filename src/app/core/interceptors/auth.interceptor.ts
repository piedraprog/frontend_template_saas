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
import { SESSION_ACCESS_TOKEN } from '../constants/session-cookies';
import { TokenService } from '../services/auth/token.service';

export const BYPASS_JW_TOKEN = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const cookieService = inject(CookieService);
  const tokenService = inject(TokenService);

  let headers = req.headers
    .set('Platform', 'web')
    .set('Authorization', `Bearer ${cookieService.get(SESSION_ACCESS_TOKEN)}`);

  const companyId = tokenService.getCompanyId();
  if (companyId) {
    headers = headers.set('X-Company-ID', companyId);
  }

  const newReq = req.clone({
    headers,
  });

  if (req.context.get(BYPASS_JW_TOKEN) === true) {
    return next(req);
  }

  return next(newReq);
};
