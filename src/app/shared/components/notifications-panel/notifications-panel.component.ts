import { CommonModule } from '@angular/common';
import {
  Component,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  NotificationsService,
  NotificationStatus,
} from '../../../core/services/notifications/notifications.service';
import { NotificationInterface } from '../../../core/models/interfaces/notification.interface';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PrimengModule } from '../../modules/primeng.module';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, PrimengModule],
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss',
})
export class NotificationsPanelComponent implements OnInit, OnChanges, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  @Input() visible: boolean = false;
  private previousVisibleState = false;

  notifications = signal<NotificationInterface[]>([]);
  archivedNotifications = signal<NotificationInterface[]>([]);
  isLoading = signal<boolean>(false);
  unreadCount = signal<number>(0);
  activeTabValue = signal<string | number>('0');

  ngOnInit() {
    this.loadNotifications();
    this.subscriptions.push(
      this.notificationsService.unreadNotifications$.subscribe((notifications) => {
        this.updateNotifications(notifications);
      }),
      this.notificationsService.unreadCount$.subscribe((count) => {
        this.unreadCount.set(count);
      }),
    );
  }

  ngOnChanges() {
    if (this.visible && !this.previousVisibleState) {
      this.markAllAsRead();
    }
    this.previousVisibleState = this.visible;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.notificationsService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.updateNotifications(notifications);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
        this.isLoading.set(false);
      },
    });
  }

  private updateNotifications(notifications: NotificationInterface[]) {
    const activeNotifications = notifications.filter(
      (n) => n.status !== NotificationStatus.ARCHIVED && n.status !== NotificationStatus.DELETED,
    );
    this.notifications.set(activeNotifications);
    const archivedNotifications = notifications.filter(
      (n) => n.status === NotificationStatus.ARCHIVED,
    );
    this.archivedNotifications.set(archivedNotifications);
    const unreadCount = activeNotifications.filter(
      (n) => n.status === NotificationStatus.UNREAD,
    ).length;
    this.unreadCount.set(unreadCount);
  }

  navigateToNotification(notification: NotificationInterface) {
    if (notification.status === NotificationStatus.UNREAD) {
      this.notificationsService.markAsRead(notification.id).subscribe();
    }
    this.router.navigate(['/dashboard']);
    this.closePanel.emit();
  }

  markAsRead(event: Event, notification: NotificationInterface) {
    event.stopPropagation();
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: (success) => {
        if (success) {
          const updated = this.notifications().map((n) =>
            n.id === notification.id ? { ...n, status: NotificationStatus.READ } : n,
          );
          this.notifications.set(updated);
        }
      },
    });
  }

  markAsArchived(event: Event, notification: NotificationInterface) {
    event.stopPropagation();
    this.notificationsService.markAsArchived(notification.id).subscribe({
      next: (success) => {
        if (success) {
          const archived = { ...notification, status: NotificationStatus.ARCHIVED };
          this.archivedNotifications.update((a) => [...a, archived]);
          this.notifications.set(this.notifications().filter((n) => n.id !== notification.id));
        }
      },
    });
  }

  unarchiveNotification(event: Event, notification: NotificationInterface) {
    event.stopPropagation();
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: (success) => {
        if (success) {
          const unarchived = { ...notification, status: NotificationStatus.READ };
          this.notifications.update((a) => [...a, unarchived]);
          this.archivedNotifications.set(
            this.archivedNotifications().filter((n) => n.id !== notification.id),
          );
        }
      },
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'REMINDER':
        return 'pi pi-clock';
      case 'ALERT':
        return 'pi pi-exclamation-circle';
      case 'ANNOUNCEMENT':
        return 'pi pi-megaphone';
      default:
        return 'pi pi-bell';
    }
  }

  markAllAsRead(): void {
    const unread = this.notifications().filter((n) => n.status === NotificationStatus.UNREAD);
    if (unread.length === 0) return;
    const updated = this.notifications().map((n) =>
      n.status === NotificationStatus.UNREAD ? { ...n, status: NotificationStatus.READ } : n,
    );
    this.notifications.set(updated);
    this.unreadCount.set(0);
    const obs = unread.map((n) =>
      this.notificationsService.markAsRead(n.id).pipe(catchError(() => of(false))),
    );
    forkJoin(obs).subscribe({
      error: () => this.loadNotifications(),
    });
  }

  @Output() closePanel = new EventEmitter<void>();
}
