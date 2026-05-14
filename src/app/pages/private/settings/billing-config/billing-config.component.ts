import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-billing-config',
  standalone: true,
  imports: [RouterModule, ButtonModule, PageHeaderComponent],
  templateUrl: './billing-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BillingConfigComponent {}
