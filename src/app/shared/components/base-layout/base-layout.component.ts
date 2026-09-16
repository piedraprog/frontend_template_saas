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
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { Permission } from '../../../core/models/enums/permission.enum';
import { PermissionService } from '../../../core/services/permission.service';
import { HelpStateService } from '../../../core/services/state/help/help-state.service';
import { ContextualHelpTourService } from '../../../core/services/ui/contextual-help-tour.service';
import { ToastService } from '../../services/toast.service';
import { BottomNavComponent, BottomNavItem } from '../bottom-nav/bottom-nav.component';
import { HelpPanelComponent } from '../help-panel/help-panel.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HelpPanelComponent,
    SidebarComponent,
    BottomNavComponent,
    RouterModule,
    ToastModule,
  ],
  template: `
    <p-toast position="top-right" [life]="5000" styleClass="app-toast-stack" />

    @if (helpPanel(); as panel) {
      <div class="admin-help-modal-backdrop" role="presentation" (click)="closeHelpPanel()">
        <div class="admin-help-modal" (click)="$event.stopPropagation()">
          <app-help-panel
            [mode]="panel"
            [progress]="helpProgress()"
            [acknowledging]="acknowledgingHelp()"
            [canStartScreenTour]="canStartScreenTour()"
            [canStartPlatformMap]="canStartPlatformMap()"
            (close)="closeHelpPanel()"
            (acknowledge)="acknowledgeLatest()"
            (startScreenTour)="startScreenTour()"
            (startPlatformMap)="startPlatformMap()"
            (viewHistory)="viewWhatsNewHistory()"
          />
        </div>
      </div>
    }

    @if (isMobile()) {
      <div class="admin-mobile-shell" data-help-chrome="mobile">
        <main class="admin-mobile-content">
          <router-outlet></router-outlet>
        </main>

        <app-bottom-nav [items]="bottomNavItems()" [notificationCount]="notificationCount()" />
      </div>
    } @else {
      <div class="admin-desktop-shell" data-help-chrome="desktop">
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

  private readonly router = inject(Router);
  private notificationsService = inject(NotificationsService);
  private permissionService = inject(PermissionService);
  private toastService = inject(ToastService);
  private readonly helpState = inject(HelpStateService);
  private readonly tours = inject(ContextualHelpTourService);
  private subscriptions: Subscription[] = [];

  readonly helpPanel = this.helpState.panel;
  readonly helpProgress = this.helpState.progress;
  readonly acknowledgingHelp = signal(false);

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

  closeHelpPanel(): void {
    this.helpState.closePanel();
  }

  canStartScreenTour(): boolean {
    return this.tours.hasScreenTourForUrl(this.router.url);
  }

  canStartPlatformMap(): boolean {
    return this.tours.canStartPlatformMap();
  }

  startScreenTour(): void {
    this.helpState.closePanel();
    window.setTimeout(() => this.tours.startTourForUrl(this.router.url), 0);
  }

  startPlatformMap(): void {
    this.helpState.closePanel();
    window.setTimeout(() => this.tours.startPlatformMap(), 0);
  }

  acknowledgeLatest(): void {
    if (this.acknowledgingHelp()) {
      return;
    }
    const request = this.helpState.acknowledgeLatestAndContinue();
    if (!request) {
      return;
    }
    this.acknowledgingHelp.set(true);
    request.subscribe({
      next: () => this.acknowledgingHelp.set(false),
      error: () => this.acknowledgingHelp.set(false),
    });
  }

  viewWhatsNewHistory(): void {
    this.helpState.closePanel();
    void this.router.navigateByUrl('/settings/novedades');
  }

  @HostListener('window:resize')
  onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.helpPanel()) {
      this.closeHelpPanel();
      return;
    }
    this.tours.closeActiveTour();
  }

  ngOnInit(): void {
    this.helpState.initialize();
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
