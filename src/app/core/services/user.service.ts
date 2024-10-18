import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  getCurrentUser() {
    console.log('se lanza getCurrentUser');
  }
}
