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
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule, Popover } from 'primeng/popover';
import { UserService } from '../../../core/services/user.service';
import { NotificationsPanelComponent } from '../notifications-panel/notifications-panel.component';

@Component({
  selector: 'app-mobile-header',
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    PopoverModule,
    NotificationsPanelComponent,
  ],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileHeaderComponent {
  @ViewChild('notificationsPopover') notificationsPopover!: Popover;

  private userService = inject(UserService);

  /** Título de la página actual */
  pageTitle = input<string>('RifaExpress');

  /** Contador de notificaciones */
  notificationCount = input<number>(0);

  /** Mostrar botón de notificaciones */
  showNotifications = input<boolean>(true);

  /** Evento al hacer click en el logo/título */
  logoClick = output<void>();

  /** Datos del usuario */
  userData = computed(() => this.userService.userData());

  /** Badge de notificaciones formateado */
  notificationBadge = computed(() => {
    const count = this.notificationCount();
    if (count === 0) return '';
    return count > 99 ? '99+' : count.toString();
  });

  /** Signal para rastrear si el panel de notificaciones está visible */
  showNotificationsPanel = signal<boolean>(false);

  toggleNotifications(event: Event): void {
    this.showNotificationsPanel.set(true);
    this.notificationsPopover.toggle(event);
  }

  closeNotifications(): void {
    this.showNotificationsPanel.set(false);
    this.notificationsPopover.hide();
  }

  onLogoClick(): void {
    this.logoClick.emit();
  }
}
