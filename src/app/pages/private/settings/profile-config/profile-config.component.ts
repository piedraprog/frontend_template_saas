import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-config',
  standalone: true,
  imports: [],
  templateUrl: './profile-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileConfigComponent {}
