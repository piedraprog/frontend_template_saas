import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  console.log('Auth Interceptor:', req.url);
  const newReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer prueba`),
    // headers: req.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`),
  });
  return next(newReq);
};
