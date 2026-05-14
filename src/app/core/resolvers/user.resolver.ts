import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/** Carga el perfil antes de activar rutas privadas (permisos y menú correctos). */
export const userResolver: ResolveFn<boolean> = () => {
  const authService = inject(AuthService);
  return authService.getProfile().pipe(map(() => true));
};
