import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  confirmCaptcha(captchaResponse: string | null): Observable<boolean> {
    const url = `${this.apiUrl}/auth/captcha`;
    return this.http.post<ApiResponse<boolean>>(url, { token: captchaResponse }).pipe(
      map((response: ApiResponse<boolean>) => response.data ?? false), // Devuelve solo el campo 'data'
    );
  }
}
