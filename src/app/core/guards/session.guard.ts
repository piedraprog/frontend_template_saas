import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const sessionGuard: CanActivateFn = () => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const accessToken = cookieService.get('accessToken');
  const userId = cookieService.get('userId');

  if (accessToken && userId) {
    router.navigate([`/${userId}/dashboard`]);
    return false;
  }

  return true;
};
