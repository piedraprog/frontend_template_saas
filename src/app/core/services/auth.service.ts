import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { LoginInterface, LoginResponseInterface } from '../../shared/interfaces/login.interface';
import {
  RegisterInterface,
  RegisterResponseInterface,
} from '../../shared/interfaces/register.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login({ email, password }: LoginInterface): Observable<LoginResponseInterface> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http
      .post<ApiResponse<LoginResponseInterface>>(url, {
        email,
        password,
      })
      .pipe(
        map((response: ApiResponse<LoginResponseInterface>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error desconocido en el login');
          }
        }),
      );
  }

  register({ email, username, password, captchaToken }: RegisterInterface): Observable<unknown> {
    const url = `${this.baseUrl}/auth/register`;

    return this.http
      .post<ApiResponse<RegisterResponseInterface>>(url, {
        username,
        email,
        password,
        captchaToken,
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

  // refreshToken(refreshToken: string): Observable<any> {

  //   const url = `${this.baseUrl}/auth/refresh`;
  //   return this.http.post<any>(url, { refreshToken });
  // }

  // logOut() {
  //   const url = `${this.baseUrl}/auth/logout`;
  //   return this.http.post<ApiResponse<any>>(url, {}).pipe(
  //     map((response: ApiResponse<any>) => {
  //       if (response.status && response.data) {
  //         return response.data;
  //       } else {
  //         throw new Error(response.message || 'Error desconocido en el logout');
  //       }
  //     }),
  //     catchError((error) => {
  //       // Aquí puedes manejar los errores de la API
  //       return throwError(() => new Error(error.message || 'Error en el servidor'));
  //     }),
  //   );
  // }
}
