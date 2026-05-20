import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { environment } from '../../../environments/environment';
import { map, Observable, tap } from 'rxjs';
import { LoginInterface, LoginResponseInterface } from '../../shared/interfaces/login.interface';
import {
  RegisterInterface,
  RegisterResponseInterface,
} from '../../shared/interfaces/register.interface';
import { CookieService } from 'ngx-cookie-service';
import { BYPASS_JW_TOKEN } from '../interceptors/auth.interceptor';
import {
  SESSION_ACCESS_TOKEN,
  SESSION_COOKIE_PATH,
  SESSION_REFRESH_TOKEN,
  SESSION_USER_ID,
} from '../constants/session-cookies';
import { LOADING_BEHAVIOR, LOADING_SCOPE } from '../interceptors/loader.interceptor';
import { UserService } from './user.service';
import { UserInterface } from '../models/interfaces/user.interface';
import { ProfileResponseInterface } from '../models/interfaces/profile-response.interface';
import { SystemRole } from '../models/enums/system-role.enum';

function profileToUser(profile: ProfileResponseInterface): UserInterface {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    companyId: profile.companyId,
    role: SystemRole.MEMBER,
    isOwner: profile.isOwner === true,
    onboardingVariant: profile.onboardingVariant,
    onboardingCurrentStep: profile.onboardingCurrentStep,
    onboardingCompletedAt: profile.onboardingCompletedAt ?? null,
    permissions: profile.permissions ?? 0,
    active: true,
    customRoleId: profile.customRoleId,
    customPermissions: profile.customPermissions ?? undefined,
    avatar: profile.avatar,
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userService = inject(UserService);
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);

  login({ email, password, ip }: LoginInterface): Observable<LoginResponseInterface> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http
      .post<ApiResponse<LoginResponseInterface>>(
        url,
        {
          email,
          password,
        },
        {
          context: new HttpContext().set(BYPASS_JW_TOKEN, true),
          headers: {
            'x-Forwarded-For': ip,
            'Platform': 'web',
          },
        },
      )
      .pipe(
        map((response: ApiResponse<LoginResponseInterface>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            console.log(response);
            throw new Error(response.message || 'Error desconocido en el login');
          }
        }),
      );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    const url = `${this.baseUrl}/auth/forgot-password`;

    return this.http
      .post<
        ApiResponse<{ message: string }>
      >(url, { email }, { context: new HttpContext().set(BYPASS_JW_TOKEN, true) })
      .pipe(
        map((response: ApiResponse<{ message: string }>) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo procesar la solicitud');
        }),
      );
  }

  resetPassword(payload: { token: string; password: string }): Observable<{ message: string }> {
    const url = `${this.baseUrl}/auth/reset-password`;

    return this.http
      .post<
        ApiResponse<{ message: string }>
      >(url, payload, { context: new HttpContext().set(BYPASS_JW_TOKEN, true) })
      .pipe(
        map((response: ApiResponse<{ message: string }>) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo restablecer la contraseña');
        }),
      );
  }

  register({
    email,
    username,
    password,
    captchaToken,
    company,
    termsCondition,
  }: RegisterInterface): Observable<unknown> {
    const url = `${this.baseUrl}/auth/register`;

    return this.http
      .post<ApiResponse<RegisterResponseInterface>>(
        url,
        {
          company,
          username,
          email,
          password,
          captchaToken,
          termsCondition,
        },
        {
          context: new HttpContext().set(BYPASS_JW_TOKEN, true),
          headers: { Platform: 'web' },
        },
      )
      .pipe(
        map((response: ApiResponse<unknown>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error desconocido en el login');
          }
        }),
      );
  }

  getProfile(): Observable<UserInterface> {
    const url = `${this.baseUrl}/auth/profile`;
    const context = new HttpContext()
      .set(LOADING_BEHAVIOR, 'page')
      .set(LOADING_SCOPE, 'auth:profile');

    return this.http.get<ApiResponse<ProfileResponseInterface>>(url, { context }).pipe(
      map((response: ApiResponse<ProfileResponseInterface>) => {
        if (response.status && response.data) {
          return profileToUser(response.data);
        }
        throw new Error(response.message || 'Error desconocido al cargar perfil');
      }),
      tap((user) => this.userService.setUserData(user)),
    );
  }

  /** Recarga perfil en memoria tras cambiar permisos del usuario actual. */
  refreshPermissions(): Observable<void> {
    return this.getProfile().pipe(map(() => undefined));
  }

  refreshToken(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
    const url = `${this.baseUrl}/auth/refresh`;
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(url, { refreshToken })
      .pipe(
        map((response: ApiResponse<{ accessToken: string; refreshToken: string }>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error desconocido en el refresh');
          }
        }),
      );
  }

  logOut(): Observable<{ message: string }> {
    const refreshToken = this.cookieService.get(SESSION_REFRESH_TOKEN);
    const url = `${this.baseUrl}/auth/logout`;
    const context = new HttpContext()
      .set(LOADING_BEHAVIOR, 'blocking')
      .set(LOADING_SCOPE, 'auth:logout');

    return this.http
      .post<ApiResponse<{ message: string }>>(
        url,
        {
          refreshToken,
        },
        { context },
      )
      .pipe(
        map((response: ApiResponse<{ message: string }>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error desconocido en el logout');
          }
        }),
      );
  }

  /**
   * Borra cookies de sesión con el mismo path que en login y limpia usuario en memoria.
   */
  removeTokens(): void {
    this.cookieService.delete(SESSION_ACCESS_TOKEN, SESSION_COOKIE_PATH);
    this.cookieService.delete(SESSION_REFRESH_TOKEN, SESSION_COOKIE_PATH);
    this.cookieService.delete(SESSION_USER_ID, SESSION_COOKIE_PATH);
    this.userService.clearSession();
  }
}
