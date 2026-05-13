import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent {}
