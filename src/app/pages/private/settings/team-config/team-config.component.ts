import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-team-config',
  standalone: true,
  imports: [RouterModule, ButtonModule, PageHeaderComponent],
  templateUrl: './team-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TeamConfigComponent {}
