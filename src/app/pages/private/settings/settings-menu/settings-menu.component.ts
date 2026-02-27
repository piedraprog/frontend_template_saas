import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { UserService } from '../../../../core/services/user.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { Permission } from '../../../../core/models/enums/permission.enum';

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  externalUrl?: string;
  /** Si se define, el ítem solo se muestra si el usuario tiene este permiso (o es owner). */
  permission?: Permission;
  /** Si true, solo visible para el propietario de la compañía. */
  ownerOnly?: boolean;
}

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule, CardModule, RippleModule],
  templateUrl: './settings-menu.component.html',
  styleUrl: './settings-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsMenuComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);

  private isOwner = computed(() => this.userService.userData().isOwner === true);

  private allSettingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Mi Perfil',
      description: 'Información personal y contraseña',
      icon: 'pi pi-user',
      route: 'profile',
    },
    {
      id: 'user-admin',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios de la compañía',
      icon: 'pi pi-users',
      route: 'user-admin',
      permission: Permission.USERS_VIEW,
    },
    {
      id: 'roles',
      title: 'Roles y Permisos',
      description: 'Crear y gestionar roles de usuario',
      icon: 'pi pi-shield',
      route: 'roles',
      permission: Permission.ROLES_VIEW,
    },
    {
      id: 'membership',
      title: 'Plan y Facturación',
      description: 'Gestionar suscripción y complementos',
      icon: 'pi pi-wallet',
      route: 'membership',
      ownerOnly: true,
    },
    {
      id: 'terms',
      title: 'Términos de Uso',
      description: 'Ver condiciones de la plataforma',
      icon: 'pi pi-file',
      externalUrl: '/terms',
    },
  ];

  settingsItems = computed(() => {
    const owner = this.isOwner();
    return this.allSettingsItems.filter((item) => {
      if (item.ownerOnly) return owner;
      if (item.permission) return this.permissionService.has(item.permission);
      return true;
    });
  });

  onItemClick(item: SettingsItem): void {
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
    } else if (item.route) {
      this.router.navigate([item.route], { relativeTo: this.route });
    }
  }

  isExternalLink(item: SettingsItem): boolean {
    return !!item.externalUrl;
  }
}
