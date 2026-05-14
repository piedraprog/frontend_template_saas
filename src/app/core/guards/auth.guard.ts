import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_ACCESS_TOKEN } from '../constants/session-cookies';

export const authGuard: CanActivateFn = () => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const accessToken = cookieService.get(SESSION_ACCESS_TOKEN)?.trim();

  if (!accessToken) {
    void router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }

  return true;
};
