import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BYPASS_JW_TOKEN } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class IPService {
  constructor(private http: HttpClient) {}

  getUserIP(): Observable<string> {
    const url = `https://api.ipify.org/?format=json`;
    return this.http
      .get<{ ip: string }>(url, {
        context: new HttpContext().set(BYPASS_JW_TOKEN, true),
      })
      .pipe(map((response: { ip: string }) => response.ip));
  }
}
