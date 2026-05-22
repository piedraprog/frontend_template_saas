import { Injectable, inject } from '@angular/core';
import { UserService } from '../user.service';
import { SESSION_COMPANY_ID_STORAGE } from '../../constants/session-cookies';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly userService = inject(UserService);

  getUserId(): string | undefined {
    const id = this.userService.userData().id;
    return id && id.length > 0 ? id : undefined;
  }

  getCompanyId(): string | undefined {
    const fromProfile = this.userService.userData().companyId;
    if (fromProfile && fromProfile.length > 0) {
      return fromProfile;
    }
    if (typeof sessionStorage === 'undefined') {
      return undefined;
    }
    const stored = sessionStorage.getItem(SESSION_COMPANY_ID_STORAGE);
    return stored && stored.length > 0 ? stored : undefined;
  }
}
