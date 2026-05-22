import {
  HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/auth/token.service';
import { SESSION_COMPANY_ID_STORAGE } from '../constants/session-cookies';

export const BYPASS_JW_TOKEN = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);

  let headers = req.headers.set('Platform', 'web');

  const companyId =
    tokenService.getCompanyId() ??
    (typeof sessionStorage !== 'undefined'
      ? (sessionStorage.getItem(SESSION_COMPANY_ID_STORAGE) ?? undefined)
      : undefined);
  if (companyId) {
    headers = headers.set('X-Company-ID', companyId);
  }

  const newReq = req.clone({
    headers,
    withCredentials: true,
  });

  if (req.context.get(BYPASS_JW_TOKEN) === true) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(newReq);
};
