import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Permission } from '../../../../../../core/models/enums/permission.enum';
import { PrimengModule } from '../../../../../../shared/modules/primeng.module';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PermissionGroup {
  name: string;
  description?: string;
  icon?: string;
  permissions: {
    label: string;
    value: Permission;
    description: string;
  }[];
}

@Component({
  selector: 'app-permission-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimengModule],
  templateUrl: './permission-editor.component.html',
  styleUrl: './permission-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionEditorComponent implements OnInit {
  currentPermissions = input<number>(0);
  rolePermissions = input<number | null>(null);
  loading = input<boolean>(false);

  @Output() savePermissions = new EventEmitter<number>();
  @Output() canceled = new EventEmitter<void>();

  localPermissions = signal<number>(0);

  /**
   * Grupos de permisos SaaS base.
   * Extender en proyectos específicos añadiendo más grupos.
   */
  permissionGroups = signal<PermissionGroup[]>([
    {
      name: 'Usuarios',
      description: 'Gestión de usuarios de la compañía',
      icon: 'pi pi-users',
      permissions: [
        {
          label: 'Ver usuarios',
          value: Permission.USERS_VIEW,
          description: 'Ver la lista de usuarios',
        },
        {
          label: 'Crear usuarios',
          value: Permission.USERS_CREATE,
          description: 'Crear nuevos usuarios',
        },
        {
          label: 'Editar usuarios',
          value: Permission.USERS_UPDATE,
          description: 'Editar usuarios existentes',
        },
        {
          label: 'Eliminar usuarios',
          value: Permission.USERS_DELETE,
          description: 'Eliminar usuarios',
        },
      ],
    },
    {
      name: 'Roles',
      description: 'Gestión de roles y permisos',
      icon: 'pi pi-shield',
      permissions: [
        {
          label: 'Ver roles',
          value: Permission.ROLES_VIEW,
          description: 'Ver los roles del equipo',
        },
        { label: 'Crear roles', value: Permission.ROLES_CREATE, description: 'Crear nuevos roles' },
        {
          label: 'Editar roles',
          value: Permission.ROLES_UPDATE,
          description: 'Editar roles existentes',
        },
        { label: 'Eliminar roles', value: Permission.ROLES_DELETE, description: 'Eliminar roles' },
      ],
    },
    {
      name: 'Auditoría',
      description: 'Acceso a logs de auditoría',
      icon: 'pi pi-history',
      permissions: [
        {
          label: 'Ver auditoría',
          value: Permission.AUDITS_VIEW,
          description: 'Ver logs de auditoría',
        },
      ],
    },
    {
      name: 'Notificaciones',
      description: 'Acceso al panel de notificaciones',
      icon: 'pi pi-bell',
      permissions: [
        {
          label: 'Ver notificaciones',
          value: Permission.NOTIFICATIONS_VIEW,
          description: 'Ver notificaciones',
        },
      ],
    },
  ]);

  private permissionChange$ = new Subject<number>();

  constructor() {
    effect(
      () => {
        this.localPermissions.set(this.currentPermissions());
      },
      { allowSignalWrites: true },
    );
    this.permissionChange$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((permissions) => this.savePermissions.emit(permissions));
  }

  ngOnInit() {
    this.localPermissions.set(this.currentPermissions());
  }

  getGroupMask(permissions: { value: number }[]): number {
    return permissions.reduce((acc, curr) => acc | curr.value, 0);
  }

  isGroupSelected(permissions: { value: number }[]): boolean {
    const mask = this.getGroupMask(permissions);
    return (this.localPermissions() & mask) === mask;
  }

  toggleGroup(permissions: { value: number }[], checked: boolean) {
    const mask = this.getGroupMask(permissions);
    const current = this.localPermissions();
    const newValue = checked ? current | mask : current & ~mask;
    this.localPermissions.set(newValue);
    this.permissionChange$.next(newValue);
  }

  hasPermission(permission: number): boolean {
    return (this.localPermissions() & permission) === permission;
  }

  togglePermission(permission: number, checked: boolean) {
    const current = this.localPermissions();
    const newValue = checked ? current | permission : current & ~permission;
    this.localPermissions.set(newValue);
    this.permissionChange$.next(newValue);
  }

  resetToRoleAll() {
    const rolePerms = this.rolePermissions();
    if (rolePerms !== null) {
      this.localPermissions.set(rolePerms);
      this.permissionChange$.next(rolePerms);
    }
  }
}
