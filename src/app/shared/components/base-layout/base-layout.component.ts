import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { Permission } from '../../../core/models/enums/permission.enum';
import { PermissionService } from '../../../core/services/permission.service';
import { ToastService } from '../../services/toast.service';
import { BottomNavComponent, BottomNavItem } from '../bottom-nav/bottom-nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    BottomNavComponent,
    RouterModule,
    ToastModule,
  ],
  template: `
    <p-toast position="top-right" [life]="5000" styleClass="app-toast-stack" />

    @if (isMobile()) {
      <div class="admin-mobile-shell">
        <main class="admin-mobile-content">
          <router-outlet></router-outlet>
        </main>

        <app-bottom-nav [items]="bottomNavItems()" [notificationCount]="notificationCount()" />
      </div>
    } @else {
      <div class="admin-desktop-shell">
        <app-sidebar />
        <main class="admin-desktop-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BaseLayoutComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebarComponent?: SidebarComponent;

  private notificationsService = inject(NotificationsService);
  private permissionService = inject(PermissionService);
  private toastService = inject(ToastService);
  private subscriptions: Subscription[] = [];

  private windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);
  isMobile = computed(() => this.windowWidth() < MOBILE_BREAKPOINT);
  notificationCount = signal(0);

  bottomNavItems = computed<BottomNavItem[]>(() => {
    const items: BottomNavItem[] = [
      {
        id: 'notifications',
        label: 'Alertas',
        icon: 'pi pi-bell',
        badge: this.notificationCount(),
      },
      {
        id: 'dashboard',
        label: 'Inicio',
        icon: 'pi pi-chart-bar',
        route: ['dashboard'],
      },
    ];

    if (this.permissionService.has(Permission.USERS_VIEW)) {
      items.push({
        id: 'users',
        label: 'Usuarios',
        icon: 'pi pi-users',
        route: ['settings', 'user-admin'],
      });
    }

    const quickActions = this.sidebarComponent?.getQuickActionsForMobile() ?? [];
    quickActions.forEach((action) => {
      items.splice(Math.min(items.length, 2), 0, {
        id: action.id,
        label: action.label,
        icon: action.icon,
        route: action.routerLink,
        action: action.command ? () => action.command?.() : undefined,
      });
    });

    if (quickActions.length === 0 && this.permissionService.has(Permission.USERS_INVITE)) {
      items.splice(Math.min(items.length, 2), 0, {
        id: 'new-user',
        label: 'Nuevo',
        icon: 'pi pi-plus',
        route: ['settings', 'user-admin'],
      });
    }

    items.push({
      id: 'settings',
      label: 'Ajustes',
      icon: 'pi pi-cog',
      route: ['settings'],
    });

    return items;
  });

  @HostListener('window:resize')
  onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  ngOnInit(): void {
    this.initNotifications();
    this.subscriptions.push(
      this.notificationsService.unreadCount$.subscribe((count) =>
        this.notificationCount.set(count),
      ),
      this.notificationsService.newNotification$.subscribe((notification) => {
        if (notification) {
          this.toastService.info(notification.message, notification.title);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initNotifications(): void {
    this.notificationsService.initWebSocket();
  }
}
