import { effect, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user.service';
import { Permission } from '../models/enums/permission.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private userService = inject(UserService);

  private userPermissions = signal<number>(0);
  private isOwner = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.userService.userData();
      this.userPermissions.set(user?.permissions ?? 0);
      this.isOwner.set(user?.isOwner === true);
    });
  }

  has(permission: Permission): boolean {
    if (this.isOwner()) return true;
    const mask = this.userPermissions();
    if (mask === -1) return true;
    return (mask & permission) === permission;
  }

  hasAny(...permissions: Permission[]): boolean {
    return permissions.some((p) => this.has(p));
  }

  hasAll(...permissions: Permission[]): boolean {
    return permissions.every((p) => this.has(p));
  }

  isOwnerUser(): boolean {
    return this.isOwner();
  }
}
