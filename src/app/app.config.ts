import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // importProvidersFrom(BrowserAnimationsModule),
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
    importProvidersFrom(NoopAnimationsModule),
    importProvidersFrom(HttpClientModule),
    // importProvidersFrom(CookieService),
  ],
};
