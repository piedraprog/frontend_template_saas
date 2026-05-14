import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const ownerGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.userData();
  if (user?.isOwner === true) {
    return true;
  }

  void router.navigate(['/', 'settings']);
  return false;
};
