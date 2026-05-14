import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from '../../../../core/services/roles/roles.service';
import { RoleInterface } from '../../../../core/models/interfaces/role.interface';
import { Permission } from '../../../../core/models/enums/permission.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PrimengModule } from '../../../../shared/modules/primeng.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserInterface } from '../../../../core/models/interfaces/user.interface';

interface PermissionOption {
  key: string;
  label: string;
  value: Permission;
  group: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, PrimengModule, FormsModule, RouterModule, PageHeaderComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private userService = inject(UserService);

  roles = signal<RoleInterface[]>([]);
  users = input<UserInterface[]>([]);
  embedded = input(false);
  isLoading = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  showEditDialog = signal<boolean>(false);
  selectedRole = signal<RoleInterface | null>(null);

  newRoleName = '';
  newRolePermissions: number = 0;

  companyId = '';

  assignedCountByRole = computed(() => {
    const counts = new Map<string, number>();
    for (const user of this.users()) {
      if (!user.customRoleId) continue;
      counts.set(user.customRoleId, (counts.get(user.customRoleId) ?? 0) + 1);
    }
    return counts;
  });

  readonly permissionOptions: PermissionOption[] = [
    { key: 'USERS_VIEW', label: 'Ver usuarios', value: Permission.USERS_VIEW, group: 'Usuarios' },
    {
      key: 'USERS_INVITE',
      label: 'Invitar usuarios',
      value: Permission.USERS_INVITE,
      group: 'Usuarios',
    },
    {
      key: 'USERS_EDIT',
      label: 'Editar usuarios',
      value: Permission.USERS_EDIT,
      group: 'Usuarios',
    },
    {
      key: 'USERS_DELETE',
      label: 'Eliminar usuarios',
      value: Permission.USERS_DELETE,
      group: 'Usuarios',
    },
    {
      key: 'ROLES_MANAGE',
      label: 'Gestionar roles',
      value: Permission.ROLES_MANAGE,
      group: 'Roles',
    },
    {
      key: 'AUDITS_VIEW',
      label: 'Ver auditoría',
      value: Permission.AUDITS_VIEW,
      group: 'Auditoría',
    },
    {
      key: 'NOTIFICATIONS_VIEW',
      label: 'Ver notificaciones',
      value: Permission.NOTIFICATIONS_VIEW,
      group: 'Notificaciones',
    },
  ];

  ngOnInit(): void {
    const user = this.userService.userData();
    this.companyId = user?.companyId ?? '';
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.rolesService.list().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  hasPermission(mask: number, perm: Permission): boolean {
    if (mask === -1) return true;
    return (mask & perm) === perm;
  }

  togglePermission(perm: Permission): void {
    this.newRolePermissions ^= perm;
  }

  permissionCount(mask: number): number {
    if (mask === -1) return this.permissionOptions.length;
    return this.permissionOptions.filter((p) => this.hasPermission(mask, p.value)).length;
  }

  assignedCount(roleId: string): number {
    return this.assignedCountByRole().get(roleId) ?? 0;
  }

  openCreate(): void {
    this.newRoleName = '';
    this.newRolePermissions = 0;
    this.showCreateDialog.set(true);
  }

  createRole(): void {
    if (!this.newRoleName.trim()) return;
    this.rolesService
      .create({
        name: this.newRoleName,
        permissions: this.newRolePermissions,
        companyId: this.companyId,
      })
      .subscribe({
        next: (role) => {
          this.roles.update((r) => [...r, role]);
          this.showCreateDialog.set(false);
        },
      });
  }

  openEdit(role: RoleInterface): void {
    this.selectedRole.set(role);
    this.newRoleName = role.name;
    this.newRolePermissions = role.permissions;
    this.showEditDialog.set(true);
  }

  updateRole(): void {
    const role = this.selectedRole();
    if (!role) return;
    this.rolesService
      .update(role.id, { name: this.newRoleName, permissions: this.newRolePermissions })
      .subscribe({
        next: (updated) => {
          this.roles.update((roles) => roles.map((r) => (r.id === updated.id ? updated : r)));
          this.showEditDialog.set(false);
        },
      });
  }

  deleteRole(role: RoleInterface): void {
    this.rolesService.delete(role.id).subscribe({
      next: () => {
        this.roles.update((r) => r.filter((x) => x.id !== role.id));
      },
    });
  }
}
