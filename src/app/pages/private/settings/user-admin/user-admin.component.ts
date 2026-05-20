import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { RolesService, CustomRole } from '../../../../core/services/roles/roles.service';
import { TokenService } from '../../../../core/services/auth/token.service';
import { AdminUserService } from '../../../../core/services/admin-user.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { PrimengModule } from '../../../../shared/modules/primeng.module';
import { UserInterface } from '../../../../core/models/interfaces/user.interface';
import { SystemRole } from '../../../../core/models/enums/system-role.enum';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import RolesComponent from '../roles/roles.component';

import { PermissionEditorComponent } from './components/permission-editor/permission-editor.component';
import { UserCreateModalComponent } from './components/user-create-modal/user-create-modal.component';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    PrimengModule,
    PermissionEditorComponent,
    UserCreateModalComponent,
    PageHeaderComponent,
    RolesComponent,
  ],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserAdminComponent implements OnInit {
  // Inyección de servicios
  fb = inject(FormBuilder);
  adminUserService = inject(AdminUserService);
  toastService = inject(ToastService);
  tokenService = inject(TokenService);
  rolesService = inject(RolesService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Signals del servicio (readonly)
  users = this.adminUserService.users;
  loading = this.adminUserService.loading;
  pagination = this.adminUserService.pagination;

  // Signals locales
  selectedUser = signal<UserInterface | null>(null); // For permission dialog
  selectedUserForView = signal<UserInterface | null>(null); // For main panel display
  showPermissionEditor = signal<boolean>(false);
  searchQuery = signal<string>('');
  activeAccessTab = signal<string>('users');

  // Getter para two-way binding del diálogo
  get permissionEditorVisible(): boolean {
    return this.showPermissionEditor();
  }

  set permissionEditorVisible(value: boolean) {
    this.showPermissionEditor.set(value);
  }

  setAccessTab(value: string | number | undefined | null): void {
    this.activeAccessTab.set(String(value ?? 'users'));
  }

  // Propiedades locales
  userForm!: FormGroup;
  availableRoles = signal<CustomRole[]>([]);

  // Signals para diálogos
  showCreateModal = signal<boolean>(false); // New control for create modal
  editUserDialog: boolean = false;
  deleteUserDialog: boolean = false;
  resettingPasswordUserId = signal<string | null>(null);

  openPermissionEditor() {
    this.showPermissionEditor.set(true);
  }

  onSavePermissions(newPermissions: number) {
    // Prefer selectedUserForView (inline editor) over selectedUser (dialog, if exists)
    // Or just check which one is active. Since we only have inline editor in HTML provided:
    const user = this.selectedUserForView() || this.selectedUser();
    if (!user || !user.id) return;

    const currentUserId = this.tokenService.getUserId();
    const isCurrentUser = user.id.toString() === currentUserId;

    this.adminUserService.updatePermissions(user.id.toString(), newPermissions).subscribe({
      next: (updatedUser) => {
        this.toastService.success('Permisos actualizados correctamente');
        this.showPermissionEditor.set(false);

        // Update the local view with the new user data to prevent stale state
        if (this.selectedUserForView()?.id === updatedUser.id) {
          this.selectedUserForView.set(updatedUser);
        }

        this.loadUsers(); // Reload list to keep sidebar in sync

        // Si el usuario editado es el usuario actual, refrescar sus permisos
        if (isCurrentUser) {
          this.authService.refreshPermissions().subscribe({
            next: () => {
              this.toastService.info(
                'Tus permisos han sido actualizados. Recarga la página si es necesario.',
              );
            },
            error: (error: unknown) => {
              console.error('Error al refrescar permisos del usuario actual:', error);
            },
          });
        }
      },
      error: (error: unknown) => {
        console.error('Error al actualizar permisos', error);
        this.toastService.error('Error al actualizar los permisos');
      },
    });
  }

  usersByRole = computed(() => {
    const users = this.users();
    const roles = this.availableRoles();
    const query = this.searchQuery().toLowerCase();

    // Filter users by search query first
    const filteredUsers = query
      ? users.filter(
          (u) => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
        )
      : users;

    const groups: Array<{
      roleId: string | null;
      roleName: string;
      users: UserInterface[];
    }> = [];

    // Group by each role (Standard Roles)
    for (const role of roles) {
      // Users belong to this role if they have the role ID
      // Even if they have customPermissions, they stay in this group
      const usersInRole = filteredUsers.filter((u) => u.customRoleId === role.id);
      if (usersInRole.length > 0) {
        groups.push({
          roleId: role.id,
          roleName: role.name,
          users: usersInRole,
        });
      }
    }

    // Special group: Custom Permissions (users strictly without role)
    // These are users who truly have NO role assigned, only raw permissions
    const customUsers = filteredUsers.filter((u) => !u.customRoleId);
    if (customUsers.length > 0) {
      groups.push({
        roleId: null,
        roleName: 'Sin Rol Asignado', // Clearer name
        users: customUsers,
      });
    }

    return groups;
  });

  // Check if a user has customized settings vs their role
  isUserCustomized(user: UserInterface): boolean {
    if (!user.customRoleId) return true; // No role = always custom
    if (user.customPermissions === undefined || user.customPermissions === null) return false; // No custom permissions = standard

    // Check if permissions differ from role defaults
    const role = this.availableRoles().find((r) => r.id === user.customRoleId);
    if (!role) return true; // Role not found? treat as custom

    return user.customPermissions !== role.permissions;
  }

  // Computed property for filtered users (kept for compatibility)
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(
      (u) => u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    );
  });

  /** Grupos colapsados manualmente; vacío = todos expandidos por defecto. */
  collapsedRoleGroups = signal<Set<string>>(new Set());

  // Profile editing
  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    customRoleId: [null as string | null],
  });

  isEditingProfile = signal<boolean>(false);
  isSavingProfile = signal(false);
  profileSaveSuccess = signal(false);
  profileSaveError = signal<string | null>(null);

  // Validation state
  get usernameErrors() {
    const control = this.profileForm.get('username');
    if (!control?.touched || !control?.invalid) return null;
    if (control.errors?.['required']) return 'El nombre de usuario es requerido';
    if (control.errors?.['minlength']) return 'Mínimo 3 caracteres';
    return null;
  }

  get emailErrors() {
    const control = this.profileForm.get('email');
    if (!control?.touched || !control?.invalid) return null;
    if (control.errors?.['required']) return 'El email es requerido';
    if (control.errors?.['email']) return 'Email inválido';
    return null;
  }

  // Method to select a user for viewing in main panel
  selectUserForView(user: UserInterface) {
    this.selectedUserForView.set(user);
  }

  constructor() {
    // Auto-select first user when users load
    effect(() => {
      const users = this.users();
      if (users.length > 0 && !this.selectedUserForView()) {
        this.selectedUserForView.set(users[0]);
      }
    });

    // Populate form and exit edit mode when a user is selected
    effect(
      () => {
        const user = this.selectedUserForView();
        if (user) {
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            customRoleId: user.customRoleId || null,
          });
          this.isEditingProfile.set(false);
          this.profileSaveSuccess.set(false);
          this.profileSaveError.set(null);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    const defaultTab = this.route.snapshot.data['defaultTab'];
    if (typeof defaultTab === 'string') {
      this.activeAccessTab.set(defaultTab);
    }
    this.initForm();
    this.loadRoles();
    this.loadUsers();
  }

  initForm() {
    this.userForm = this.fb.group({
      id: [0],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      customRoleId: ['', Validators.required],
    });
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
      },
      error: (error: unknown) => {
        console.error('Error al cargar roles', error);
        this.toastService.error('No se pudieron cargar los roles');
      },
    });
  }

  loadUsers() {
    const params = {
      page: 1,
      limit: 10,
      search: '',
    };

    this.adminUserService.getTeamMembers(params).subscribe({
      next: () => {},
      error: (error: unknown) => {
        console.error('Error al cargar usuarios', error);
        this.toastService.error('No se pudieron cargar los usuarios');
      },
    });
  }

  getEmptyUser(): UserInterface {
    const companyId = this.userService.userData().companyId ?? '';
    return {
      id: '',
      username: '',
      email: '',
      avatar: '',
      role: SystemRole.MEMBER,
      isOwner: false,
      permissions: 0,
      active: false,
      customRoleId: '',
      companyId,
    };
  }

  openNew() {
    this.showCreateModal.set(true);
  }

  editUser(user: UserInterface) {
    if (!user) return;
    this.userForm.patchValue(user);
    this.editUserDialog = true;
  }

  confirmDeleteUser(user: UserInterface) {
    if (!user) return;
    this.selectedUser.set(user);
    this.deleteUserDialog = true;
  }

  confirmAdminResetPassword(user: UserInterface) {
    if (!user?.id) {
      return;
    }

    const userId = user.id.toString();
    this.resettingPasswordUserId.set(userId);

    this.adminUserService
      .adminResetPassword(userId)
      .pipe(finalize(() => this.resettingPasswordUserId.set(null)))
      .subscribe({
        next: (response) => {
          this.toastService.success(
            'Contraseña restablecida',
            response.message ?? 'Se enviaron las nuevas credenciales por correo.',
          );
        },
        error: (error: unknown) => {
          console.error('Error al restablecer contraseña', error);
          this.toastService.error('No se pudo restablecer la contraseña del usuario');
        },
      });
  }

  // Updated to only handle Edit User
  saveNewUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData = this.userForm.value;
    // Assuming this method now strictly handles updates since creation is in child component
    // Added safety check although UI should prevent ID 0 in edit mode mostly
    if (userData.id !== 0) {
      this.adminUserService
        .updateUser(userData.id.toString(), {
          username: userData.username,
          email: userData.email,
          customRoleId: userData.customRoleId,
        } as Partial<UserInterface>)
        .subscribe({
          next: () => {
            this.toastService.success('Usuario actualizado correctamente');
            this.editUserDialog = false;
            this.userForm.reset(this.getEmptyUser());
            this.loadUsers();
          },
          error: (error: unknown) => {
            console.error('Error al actualizar usuario', error);
            this.toastService.error('No se pudo actualizar el usuario');
          },
        });
    }
  }

  deleteUser() {
    const selectedUser = this.selectedUser();
    if (!selectedUser) return;

    if (selectedUser.id?.toString() === this.tokenService.getUserId()) {
      this.toastService.error('No puede eliminarse a sí mismo');
      this.deleteUserDialog = false;
      return;
    }

    this.adminUserService.deleteUser(selectedUser.id.toString()).subscribe({
      next: () => {
        this.toastService.success('Usuario eliminado correctamente');
        this.deleteUserDialog = false;
        this.selectedUser.set(this.getEmptyUser());
      },
      error: (error: unknown) => {
        console.error('Error al eliminar usuario', error);
        const message =
          error !== null && typeof error === 'object' && ('error' in error || 'message' in error)
            ? ((error as { error?: { message?: string }; message?: string }).error?.message ??
              (error as { message?: string }).message ??
              'No se pudo eliminar el usuario')
            : 'No se pudo eliminar el usuario';
        this.toastService.error(message);
      },
    });
  }

  onSearchUsers(term: string) {
    this.searchQuery.set(term);
    // The filteredUsers computed property will automatically update
  }

  openPermissionEditorForUser(user: UserInterface) {
    this.selectedUser.set(user);
    this.openPermissionEditor();
  }

  getEffectivePermissions(user: UserInterface): number {
    if (user.customPermissions !== undefined && user.customPermissions !== null) {
      return user.customPermissions;
    }

    if (user.customRoleId) {
      const role = this.availableRoles().find((r) => r.id === user.customRoleId);
      return role ? role.permissions : 0;
    }

    return 0;
  }

  getRolePermissions(user: UserInterface): number | null {
    if (user.customRoleId) {
      const role = this.availableRoles().find((r) => r.id === user.customRoleId);
      return role ? role.permissions : null;
    }
    return null;
  }

  // Role group expand/collapse (por defecto todos expandidos)
  isExpanded(roleId: string | null): boolean {
    const key = roleId?.toString() ?? 'custom';
    return !this.collapsedRoleGroups().has(key);
  }

  toggleRoleGroup(roleId: string | null) {
    const key = roleId?.toString() ?? 'custom';
    const collapsed = new Set(this.collapsedRoleGroups());
    if (collapsed.has(key)) {
      collapsed.delete(key);
    } else {
      collapsed.add(key);
    }
    this.collapsedRoleGroups.set(collapsed);
  }

  // Profile editing methods
  startEditingProfile() {
    this.isEditingProfile.set(true);
    this.profileSaveSuccess.set(false);
    this.profileSaveError.set(null);
  }

  cancelEditingProfile() {
    const user = this.selectedUserForView();
    if (user) {
      this.profileForm.patchValue({
        username: user.username,
        email: user.email,
        customRoleId: user.customRoleId || null,
      });
    }
    this.isEditingProfile.set(false);
    this.profileSaveSuccess.set(false);
    this.profileSaveError.set(null);
  }

  saveProfileChanges() {
    const user = this.selectedUserForView();
    if (!user || this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      this.toastService.error('Por favor, corrija los errores en el formulario');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileSaveError.set(null);

    const formValue = this.profileForm.value;
    const updateData: Partial<UserInterface> = {
      username: formValue.username!,
      email: formValue.email!,
      customRoleId: formValue.customRoleId ?? undefined,
    };

    this.adminUserService
      .updateUser(user.id, updateData)
      .pipe(finalize(() => this.isSavingProfile.set(false)))
      .subscribe({
        next: (updatedUser: UserInterface) => {
          console.log('Updated User from backend:', updatedUser);
          this.profileSaveSuccess.set(true);
          this.isEditingProfile.set(false);
          setTimeout(() => this.profileSaveSuccess.set(false), 2000);
          this.toastService.success('Perfil actualizado correctamente');

          // Update the local view with the new user data to prevent stale state
          if (this.selectedUserForView()?.id === updatedUser.id) {
            this.selectedUserForView.set({
              ...updatedUser,
              customRoleId: formValue.customRoleId ?? undefined,
              roleName: updatedUser.roleName,
            });
          }

          this.loadUsers();
        },
        error: (error: unknown) => {
          this.profileSaveError.set('Error al actualizar el perfil');
          console.error('Error updating user profile:', error);
        },
      });
  }
}
