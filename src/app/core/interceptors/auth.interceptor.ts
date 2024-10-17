import {
  HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const BYPASS_JW_TOKEN = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // TODO: AGREGAR la ip a todas las peticiones
  console.log('Auth Interceptor:', req.url);
  const newReq = req.clone({
    // eslint-disable-next-line prettier/prettier
    headers: req.headers.set('Platform', 'web').set('Authorization', `Bearer prueba`),

    // headers: req.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`),
  });

  if (req.context.get(BYPASS_JW_TOKEN) === true) {
    return next(req);
  }

  return next(newReq);
};
