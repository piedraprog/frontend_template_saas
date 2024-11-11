import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { LoginInterface, LoginResponseInterface } from '../../shared/interfaces/login.interface';
import {
  RegisterInterface,
  RegisterResponseInterface,
} from '../../shared/interfaces/register.interface';
import { CookieService } from 'ngx-cookie-service';
import { ProfileResponseInterface } from '../models/interfaces/profile.interface';
import { BYPASS_JW_TOKEN } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

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
      .post<ApiResponse<RegisterResponseInterface>>(url, {
        company,
        username,
        email,
        password,
        captchaToken,
        termsCondition,
      })
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

  getProfile(): Observable<ProfileResponseInterface> {
    const url = `${this.baseUrl}/auth/profile`;
    return this.http.get<ApiResponse<ProfileResponseInterface>>(url).pipe(
      map((response: ApiResponse<ProfileResponseInterface>) => {
        if (response.status && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error desconocido en el login');
        }
      }),
    );
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
    const refreshToken = this.cookieService.get('refreshToken');
    const url = `${this.baseUrl}/auth/logout`;

    return this.http
      .post<ApiResponse<{ message: string }>>(url, {
        refreshToken,
      })
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

  removeTokens() {
    this.cookieService.delete('accessToken');
    this.cookieService.delete('refreshToken');
  }
}
