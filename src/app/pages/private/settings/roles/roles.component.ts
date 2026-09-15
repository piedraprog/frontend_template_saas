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
import { PageLoadingSkeletonComponent } from '../../../../shared/components/page-loading-skeleton/page-loading-skeleton.component';
import { PrimengModule } from '../../../../shared/modules/primeng.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserInterface } from '../../../../core/models/interfaces/user.interface';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../../shared/services/toast.service';
import { mapHttpErrorToUserMessage } from '../../../../core/utils/map-http-error-to-user-message';
import { finalize } from 'rxjs';

interface PermissionOption {
  key: string;
  label: string;
  value: Permission;
  group: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    PrimengModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    PageLoadingSkeletonComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  roles = signal<RoleInterface[]>([]);
  users = input<UserInterface[]>([]);
  embedded = input(false);
  isLoading = signal<boolean>(false);
  mutating = signal(false);
  showCreateDialog = signal<boolean>(false);
  showEditDialog = signal<boolean>(false);
  selectedRole = signal<RoleInterface | null>(null);

  newRoleName = '';
  newRolePermissions: number = 0;

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
      key: 'NOTIFICATIONS_VIEW',
      label: 'Ver notificaciones',
      value: Permission.NOTIFICATIONS_VIEW,
      group: 'Notificaciones',
    },
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.rolesService
      .list()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
        },
        error: (error: unknown) => {
          this.toastService.error(
            mapHttpErrorToUserMessage(error, 'No se pudieron cargar los roles'),
          );
        },
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
    if (!this.newRoleName.trim() || this.mutating()) return;
    this.mutating.set(true);
    this.rolesService
      .create({
        name: this.newRoleName,
        permissions: this.newRolePermissions,
      })
      .pipe(finalize(() => this.mutating.set(false)))
      .subscribe({
        next: (role) => {
          this.roles.update((r) => [...r, role]);
          this.showCreateDialog.set(false);
          this.toastService.success(`El rol "${role.name}" quedó disponible para asignarlo.`);
        },
        error: (error: unknown) => {
          this.toastService.error(mapHttpErrorToUserMessage(error, 'No se pudo crear el rol'));
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
    if (!role || this.mutating()) return;
    this.mutating.set(true);
    this.rolesService
      .update(role.id, { name: this.newRoleName, permissions: this.newRolePermissions })
      .pipe(finalize(() => this.mutating.set(false)))
      .subscribe({
        next: (updated) => {
          this.roles.update((roles) => roles.map((r) => (r.id === updated.id ? updated : r)));
          this.showEditDialog.set(false);
          this.toastService.success(`Los cambios del rol "${updated.name}" quedaron guardados.`);
        },
        error: (error: unknown) => {
          this.toastService.error(
            mapHttpErrorToUserMessage(error, 'No se pudo actualizar el rol'),
          );
        },
      });
  }

  confirmDeleteRole(role: RoleInterface, event?: Event): void {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: `¿Eliminar permanentemente el rol "${role.name}"? Los usuarios asignados quedarán sin ese rol.`,
      header: 'Eliminar rol',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.deleteRole(role),
    });
  }

  deleteRole(role: RoleInterface): void {
    if (this.mutating()) return;
    this.mutating.set(true);
    this.rolesService
      .delete(role.id)
      .pipe(finalize(() => this.mutating.set(false)))
      .subscribe({
        next: () => {
          this.roles.update((r) => r.filter((x) => x.id !== role.id));
          this.toastService.success(`El rol "${role.name}" fue eliminado.`);
        },
        error: (error: unknown) => {
          this.toastService.error(
            mapHttpErrorToUserMessage(error, 'No se pudo eliminar el rol'),
          );
        },
      });
  }
}
