import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = () => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const accessToken = cookieService.get('accessToken');

  if (!accessToken) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
