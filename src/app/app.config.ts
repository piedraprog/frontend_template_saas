import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { loadRuntimeEnvironment } from '../environments/load-runtime-environment';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { responseTimeInterceptor } from './core/interceptors/response-time.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { DIErrorInterceptor } from './core/interceptors/DIerror.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (): (() => Promise<void>) => () => loadRuntimeEnvironment(),
    },
    MessageService,
    providePrimeNG({
      ripple: true,
      zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100,
      },
    }),
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        responseTimeInterceptor,
        loaderInterceptor,
        authInterceptor,
        retryInterceptor,
        // errorInterceptor,
      ]),
      withInterceptorsFromDi(),
      withFetch(),
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DIErrorInterceptor,
      multi: true,
    },
  ],
};
