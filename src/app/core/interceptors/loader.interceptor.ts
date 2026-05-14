import {
  HttpContextToken,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { LoaderService } from '../services/loading.service';
import type { LoadingBehavior } from '../services/loading.service';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';

export const LOADING_BEHAVIOR = new HttpContextToken<LoadingBehavior>(() => 'silent');
export const LOADING_SCOPE = new HttpContextToken<string>(() => 'global');

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const loadingService = inject(LoaderService);
  const behavior = req.context.get(LOADING_BEHAVIOR);
  const scope = req.context.get(LOADING_SCOPE);
  const finishLoading = loadingService.start(behavior, scope);

  return next(req).pipe(
    finalize(() => {
      finishLoading();
    }),
  );
};
