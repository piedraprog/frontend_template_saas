import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, retry, throwError, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const MAX_OF_RETRY = 3;
  const RETRY_DELAY = 1000;

  return next(req).pipe(
    retry({
      count: MAX_OF_RETRY,
      delay: (error: HttpErrorResponse, retryAttempt: number): Observable<number> => {
        // if maximum number of retries have been met
        // or response is a status code we don't wish to retry, throw error
        if (retryAttempt > MAX_OF_RETRY || error.status !== 404) {
          return throwError(() => error);
        }
        console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * RETRY_DELAY}ms`);
        return timer(retryAttempt * RETRY_DELAY);
      },
    }),
  );
};
