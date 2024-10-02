import { CanActivateFn } from '@angular/router';

export const loggedGuard: CanActivateFn = (route, state) => {
  console.log('loggedGuard', route, state);

  return true;
};
