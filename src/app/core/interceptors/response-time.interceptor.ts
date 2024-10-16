import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

export const responseTimeInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  return next(req).pipe(
    finalize(() => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      console.log(`Request to ${req.url} took ${responseTime}ms`);
    }),
  );
};
