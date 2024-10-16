import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if (error.status === 401) {
          // Specific handling for unauthorized errors
          console.error('Unauthorized request:', error);
          // You might trigger a re-authentication flow or redirect the user here
        } else {
          // Handle other HTTP error codes
          console.error('HTTP error:', error);
        }
      } else {
        // Handle non-HTTP errors
        console.error('An error occurred:', error);
      }

      // Re-throw the error to propagate it further
      return throwError(() => error);
    }),
  );
};
