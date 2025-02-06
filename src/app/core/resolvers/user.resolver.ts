import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userResolver: ResolveFn<boolean> = () => {
  const authService = inject(AuthService);
  authService.getProfile().subscribe();
  return true;
};
