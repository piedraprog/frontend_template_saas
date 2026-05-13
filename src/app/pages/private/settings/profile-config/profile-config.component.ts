import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-profile-config',
  standalone: true,
  imports: [RouterModule, ButtonDirective],
  templateUrl: './profile-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileConfigComponent {}
