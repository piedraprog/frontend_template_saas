import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewChild,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule, Popover } from 'primeng/popover';
import { UserService } from '../../../core/services/user.service';
import { NotificationsPanelComponent } from '../notifications-panel/notifications-panel.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  action?: () => void;
}

@Component({
  selector: 'app-bottom-nav',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    BadgeModule,
    RippleModule,
    AvatarModule,
    PopoverModule,
    NotificationsPanelComponent,
  ],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  @ViewChild('notificationsPopover') notificationsPopover!: Popover;
  @ViewChild('profilePopover') profilePopover!: Popover;

  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationsService = inject(NotificationsService);

  items = input.required<BottomNavItem[]>();
  notificationCount = input<number>(0);
  notificationClick = output<void>();

  userData = computed(() => this.userService.userData());

  notificationBadge = computed(() => {
    const count = this.notificationCount();
    if (count === 0) return '';
    return count > 99 ? '99+' : count.toString();
  });

  navItems = computed(() => {
    return this.items().map((item) => {
      if (item.id === 'notifications') {
        return { ...item, badge: this.notificationCount() };
      }
      return item;
    });
  });

  showNotificationsPanel = signal<boolean>(false);

  onItemClick(item: BottomNavItem, event?: Event): void {
    if (item.action) {
      item.action();
    } else if (item.id === 'notifications') {
      if (event) {
        this.toggleNotifications(event);
      } else {
        this.notificationClick.emit();
      }
    } else if (item.id === 'profile') {
      if (event) {
        this.toggleProfile(event);
      }
    }
  }

  toggleNotifications(event: Event): void {
    this.showNotificationsPanel.set(true);
    this.notificationsPopover.toggle(event);
  }

  closeNotifications(): void {
    this.showNotificationsPanel.set(false);
    this.notificationsPopover.hide();
  }

  toggleProfile(event: Event): void {
    this.profilePopover.toggle(event);
  }

  closeProfile(): void {
    this.profilePopover.hide();
  }

  isActive(item: BottomNavItem): boolean {
    if (!item.route) return false;
    return this.router.url.includes(item.route);
  }

  onLogout(): void {
    this.closeProfile();
    this.authService.logOut().subscribe({
      next: () => {
        this.notificationsService.disconnectWebSocket();
        this.router.navigate(['/login']);
      },
    });
  }
}
