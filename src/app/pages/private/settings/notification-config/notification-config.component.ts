import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-notification-config',
  standalone: true,
  imports: [],
  templateUrl: './notification-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationConfigComponent {}
