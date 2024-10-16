import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { responseTimeInterceptor } from './core/interceptors/response-time.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';

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
        errorInterceptor,
      ]),
      withFetch(),
    ),
    importProvidersFrom(NoopAnimationsModule),
    importProvidersFrom(HttpClientModule),
    // importProvidersFrom(CookieService),
  ],
};
