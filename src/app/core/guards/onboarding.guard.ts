import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { OnboardingService } from '../services/onboarding.service';
import { UserService } from '../services/user.service';

export const onboardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const onboardingService = inject(OnboardingService);
  const userService = inject(UserService);
  const user = userService.userData();

  if (!user.companyId) {
    return true;
  }

  return onboardingService.loadState().pipe(
    map((state) => {
      if (state.isCompleted) {
        return true;
      }

      return router.createUrlTree(['/onboarding']);
    }),
  );
};
