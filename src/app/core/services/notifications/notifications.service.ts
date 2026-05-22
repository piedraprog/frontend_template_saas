import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/interfaces/response.interface';
import { io, Socket } from 'socket.io-client';
import {
  NotificationInterface,
  NotificationEvent,
  NotificationStatus,
} from '../../models/interfaces/notification.interface';

export { NotificationStatus };

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private socket: Socket | null = null;

  private unreadNotificationsSubject = new BehaviorSubject<NotificationInterface[]>([]);
  public unreadNotifications$ = this.unreadNotificationsSubject.asObservable();

  private newNotificationSubject = new BehaviorSubject<NotificationInterface | null>(null);
  public newNotification$ = this.newNotificationSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private http = inject(HttpClient);

  initWebSocket(token?: string): void {
    if (!this.socket) {
      const wsUrl = environment.apiUrl
        ? `${environment.apiUrl}/notifications`
        : `${window.location.origin}/notifications`;
      this.socket = io(wsUrl, {
        ...(token ? { query: { token } } : {}),
        withCredentials: true,
        transports: ['websocket'],
      });
      this.setupSocketListeners();
      this.loadInitialNotifications();
    }
  }

  private loadInitialNotifications(): void {
    this.getMyNotifications().subscribe({
      next: (notifications) => {
        this.unreadNotificationsSubject.next(notifications);
        const unreadCount = notifications.filter(
          (n) => n.status === NotificationStatus.UNREAD,
        ).length;
        this.unreadCountSubject.next(unreadCount);
      },
      error: (error) => console.error('Error loading initial notifications:', error),
    });
  }

  setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('notification.event', (event: NotificationEvent) => {
      switch (event.type) {
        case 'new':
          this.getNotificationById(event.id).subscribe({
            next: (notification) => {
              if (notification) this.addNotification(notification);
            },
          });
          break;
        case 'updated':
          this.getNotificationById(event.id).subscribe({
            next: (notification) => {
              if (notification) this.updateNotification(notification);
            },
          });
          break;
        case 'deleted':
          this.removeNotification(event.id);
          break;
      }
    });

    this.socket.on('connect', () =>
      console.log('Conectado al servidor de notificaciones:', this.socket?.id),
    );
    this.socket.on('disconnect', (reason: string) =>
      console.log('Desconectado del servidor de notificaciones. Razón:', reason),
    );
    this.socket.on('connect_error', (error: Error) =>
      console.error('Error de conexión al WebSocket:', error),
    );
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private addNotification(notification: NotificationInterface): void {
    const current = this.unreadNotificationsSubject.value;
    this.unreadNotificationsSubject.next([notification, ...current]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    this.newNotificationSubject.next(notification);
  }

  private updateNotification(notification: NotificationInterface): void {
    const current = this.unreadNotificationsSubject.value;
    const index = current.findIndex((n) => n.id === notification.id);
    if (index !== -1) {
      const oldStatus = current[index].status;
      const updated = [...current];
      updated[index] = notification;
      this.unreadNotificationsSubject.next(updated);
      if (
        oldStatus === NotificationStatus.UNREAD &&
        notification.status !== NotificationStatus.UNREAD
      ) {
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      } else if (
        oldStatus !== NotificationStatus.UNREAD &&
        notification.status === NotificationStatus.UNREAD
      ) {
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      }
    }
  }

  private removeNotification(id: string): void {
    const current = this.unreadNotificationsSubject.value;
    const notification = current.find((n) => n.id === id);
    if (notification) {
      this.unreadNotificationsSubject.next(current.filter((n) => n.id !== id));
      if (notification.status === NotificationStatus.UNREAD) {
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      }
    }
  }

  getNotificationById(id: string): Observable<NotificationInterface | null> {
    return this.http.get<ApiResponse<NotificationInterface>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => (res.status && res.data ? res.data : null)),
      catchError(() => of(null)),
    );
  }

  getMyNotifications(): Observable<NotificationInterface[]> {
    return this.http.get<ApiResponse<NotificationInterface[]>>(`${this.apiUrl}/me`).pipe(
      map((res) => (res.status && res.data ? res.data : [])),
      catchError(() => of([])),
    );
  }

  markAsRead(id: string): Observable<boolean> {
    return this.http.put<ApiResponse<NotificationInterface>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      map((res) => res.status === true),
      catchError(() => of(false)),
    );
  }

  markAsArchived(id: string): Observable<boolean> {
    return this.http
      .put<ApiResponse<NotificationInterface>>(`${this.apiUrl}/${id}/archive`, {})
      .pipe(
        map((res) => res.status === true),
        catchError(() => of(false)),
      );
  }
}
