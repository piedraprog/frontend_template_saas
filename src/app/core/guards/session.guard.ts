import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_ACCESS_TOKEN, SESSION_USER_ID } from '../constants/session-cookies';

export const sessionGuard: CanActivateFn = () => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const accessToken = cookieService.get(SESSION_ACCESS_TOKEN)?.trim();
  const userId = cookieService.get(SESSION_USER_ID)?.trim();

  if (accessToken && userId) {
    void router.navigateByUrl(`/${userId}/dashboard`, { replaceUrl: true });
    return false;
  }

  return true;
};
