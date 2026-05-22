import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpContext } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/response.interface';
import { BYPASS_JW_TOKEN } from '../../core/interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  confirmCaptcha(captchaResponse: string | null): Observable<boolean> {
    const url = `${this.apiUrl}/auth/captcha`;
    return this.http
      .post<ApiResponse<{ success: boolean }>>(url, { token: captchaResponse }, {
        context: new HttpContext().set(BYPASS_JW_TOKEN, true),
        withCredentials: true,
      })
      .pipe(map((response) => response.data?.success === true));
  }
}
