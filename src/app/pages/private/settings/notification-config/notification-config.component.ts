import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

interface NotificationPrefRow {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notification-config',
  standalone: true,
  imports: [RouterModule, FormsModule, ToggleSwitchModule],
  templateUrl: './notification-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationConfigComponent {
  readonly prefs = signal<NotificationPrefRow[]>([
    {
      id: 'email-product',
      title: 'Actualizaciones del producto',
      description:
        'Novedades, mejoras importantes y avisos de mantenimiento poco frecuentes por correo.',
      icon: 'pi pi-megaphone',
      enabled: true,
    },
    {
      id: 'email-security',
      title: 'Seguridad',
      description: 'Alertas de inicio de sesión, cambios sensibles en la cuenta o permisos.',
      icon: 'pi pi-lock',
      enabled: true,
    },
    {
      id: 'toast-inline',
      title: 'Avisos rápidos en el panel',
      description:
        'Mensajes tipo toast en la esquina superior derecha cuando guardas o falla una acción.',
      icon: 'pi pi-comments',
      enabled: true,
    },
  ]);

  setEnabled(id: string, enabled: boolean): void {
    this.prefs.update((rows) => rows.map((row) => (row.id === id ? { ...row, enabled } : row)));
  }
}
