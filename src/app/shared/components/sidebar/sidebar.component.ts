import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  OnDestroy,
  OnInit,
  untracked,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';
import { Subscription, finalize } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_ACCESS_TOKEN } from '../../../core/constants/session-cookies';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { PermissionService } from '../../../core/services/permission.service';
import { UserService } from '../../../core/services/user.service';
import { Permission } from '../../../core/models/enums/permission.enum';
import { NotificationsPanelComponent } from '../notifications-panel/notifications-panel.component';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  routerLink?: unknown[] | string;
  badge?: string | number;
  command?: (event?: Event) => void;
  severity?: 'default' | 'danger' | 'success' | 'info' | 'warning';
  color?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  showInMobileNav?: boolean;
  permission?: Permission;
  module?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  host: {
    class: 'admin-sidebar-host shrink-0',
    '[class.sidebar-collapsed]': '!isFullDisplay()',
  },
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    ConfirmDialogModule,
    NotificationsPanelComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('notificationsPanelContainer', { read: ElementRef })
  notificationsPanelContainer?: ElementRef<HTMLElement>;

  private authService = inject(AuthService);
  private cookieService = inject(CookieService);
  private notificationsService = inject(NotificationsService);
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private subscriptions: Subscription[] = [];

  profileData = computed(() => this.userService.userData());
  isFullDisplay = signal(true);
  notificationCount = signal(0);
  showNotificationsPanel = signal(false);

  mainMenuItems = signal<SidebarMenuItem[]>([]);
  quickActionsItems = signal<SidebarMenuItem[]>([]);
  footerMenuItems = signal<SidebarMenuItem[]>([]);

  constructor() {
    effect(() => {
      this.userService.userData();
      this.notificationCount();
      this.isFullDisplay();
      untracked(() => this.buildMenu());
    });
  }

  ngOnInit(): void {
    this.initNotifications();
    this.subscriptions.push(
      this.notificationsService.unreadCount$.subscribe((count) => {
        this.notificationCount.set(count);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private tenantIdFromUrl(): string | undefined {
    const path = this.router.url.split('?')[0] ?? '';
    return path.replace(/^\//, '').split('/').filter(Boolean)[0] || undefined;
  }

  routeFor(...segments: string[]): unknown[] {
    const tenantId = this.tenantIdFromUrl();
    return tenantId ? ['/', tenantId, ...segments] : ['/', ...segments];
  }

  private can(permission?: Permission): boolean {
    return permission ? this.permissionService.has(permission) : true;
  }

  private buildMenu(): void {
    const main: SidebarMenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: PrimeIcons.CHART_BAR,
        routerLink: this.routeFor('dashboard'),
        module: true,
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: PrimeIcons.USERS,
        routerLink: this.routeFor('settings', 'user-admin'),
        permission: Permission.USERS_VIEW,
        module: true,
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: PrimeIcons.SHIELD,
        routerLink: this.routeFor('settings', 'roles'),
        permission: Permission.ROLES_MANAGE,
        module: true,
      },
      {
        id: 'notifications',
        label: 'Notificaciones',
        icon: PrimeIcons.BELL,
        badge: this.notificationCount() || undefined,
        permission: Permission.NOTIFICATIONS_VIEW,
        command: (event?: Event) => this.toggleNotificationsPanel(event),
      },
    ];

    const quickActions: SidebarMenuItem[] = [
      {
        id: 'quick-team',
        label: 'Gestión de equipo',
        icon: PrimeIcons.USERS,
        routerLink: this.routeFor('settings', 'user-admin'),
        color: 'primary',
        showInMobileNav: true,
        permission: Permission.USERS_VIEW,
      },
      {
        id: 'new-user',
        label: 'Invitar usuario',
        icon: 'pi pi-user-plus',
        routerLink: this.routeFor('settings', 'user-admin'),
        color: 'success',
        showInMobileNav: true,
        permission: Permission.USERS_INVITE,
      },
    ];

    const footer: SidebarMenuItem[] = [
      {
        id: 'settings',
        label: 'Configuración',
        icon: PrimeIcons.COG,
        routerLink: this.routeFor('settings'),
      },
      {
        id: 'membership',
        label: 'Mi plan',
        icon: 'pi pi-crown',
        routerLink: this.routeFor('settings', 'membership'),
      },
      {
        id: 'toggle',
        label: this.isFullDisplay() ? 'Colapsar menú' : 'Expandir menú',
        icon: this.isFullDisplay() ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right',
        command: () => this.toggleSidebar(),
      },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        severity: 'danger',
        command: (event?: Event) => this.logout(event),
      },
    ];

    this.mainMenuItems.set(main.filter((item) => this.can(item.permission)));
    this.quickActionsItems.set(quickActions.filter((item) => this.can(item.permission)));
    this.footerMenuItems.set(footer);
  }

  private initNotifications(): void {
    const token = this.cookieService.get(SESSION_ACCESS_TOKEN)?.trim();
    if (token) {
      this.notificationsService.initWebSocket(token);
    }
  }

  toggleSidebar(): void {
    this.isFullDisplay.update((value) => !value);
  }

  toggleNotificationsPanel(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.showNotificationsPanel.update((value) => !value);
  }

  closeNotificationsPanel(): void {
    this.showNotificationsPanel.set(false);
  }

  isActiveRoute(routerLink: unknown[] | string | undefined): boolean {
    if (!routerLink) return false;
    const link = Array.isArray(routerLink)
      ? routerLink.filter((part) => part !== '/').join('/')
      : routerLink;
    return this.router.url.includes(link.replace(/^\//, ''));
  }

  getQuickActionsForMobile(): SidebarMenuItem[] {
    return this.quickActionsItems().filter((item) => item.showInMobileNav === true);
  }

  logout(event?: Event): void {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: '¿Deseas cerrar sesión en esta cuenta?',
      header: 'Confirmar cierre de sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.authService
          .logOut()
          .pipe(
            finalize(() => {
              this.notificationsService.disconnectWebSocket();
              this.authService.removeTokens();
              void this.router.navigateByUrl('/login', { replaceUrl: true });
            }),
          )
          .subscribe();
      },
    });
  }
}
