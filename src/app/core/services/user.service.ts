import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserInterface } from '../models/interfaces/user.interface';
import { SystemRole } from '../models/enums/system-role.enum';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.apiUrl;

  #userData = signal<UserInterface>({
    id: '',
    username: '',
    email: '',
    role: SystemRole.MEMBER,
    companyId: '',
    isOwner: false,
    permissions: 0,
    active: false,
  });

  public userData = computed(() => this.#userData());

  setUserData(user: UserInterface) {
    this.#userData.set(user); // Guarda los datos en el signal
  }

  getUserData() {
    return this.#userData; // Retorna el signal
  }
}
