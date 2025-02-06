import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment.development';
import { UserInterface } from '../models/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.apiUrl;

  #userData = signal<UserInterface>({
    id: '',
    username: '',
    email: '',
    role: 1,
    companyId: '',
  });

  public userData = computed(() => this.#userData());

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  setUserData(user: UserInterface) {
    this.#userData.set(user); // Guarda los datos en el signal
  }

  getUserData() {
    return this.#userData; // Retorna el signal
  }
}
