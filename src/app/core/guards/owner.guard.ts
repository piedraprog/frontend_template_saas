import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

export const ownerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.userData();
  if (user?.isOwner === true) {
    return true;
  }

  const teamId =
    route.parent?.paramMap?.get('teamId') ?? route.parent?.parent?.paramMap?.get('teamId');
  if (teamId) {
    router.navigate([teamId, 'settings']);
  } else {
    router.navigate(['/']);
  }
  return false;
};
