import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { LoaderService } from '../services/loading.service';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const loadingService = inject(LoaderService);
  loadingService.showLoader();

  return next(req).pipe(
    finalize(() => {
      loadingService.hideLoader();
    }),
  );
};
