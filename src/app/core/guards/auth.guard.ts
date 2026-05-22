import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SESSION_USER_ID } from '../constants/session-cookies';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const userId =
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_USER_ID)?.trim() : '';

  if (!userId) {
    void router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }

  return true;
};
