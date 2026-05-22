import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SESSION_USER_ID } from '../constants/session-cookies';

export const sessionGuard: CanActivateFn = () => {
  const router = inject(Router);

  const userId =
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_USER_ID)?.trim() : '';

  if (userId) {
    void router.navigateByUrl('/dashboard', { replaceUrl: true });
    return false;
  }

  return true;
};
