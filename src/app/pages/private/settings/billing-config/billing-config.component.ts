import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-billing-config',
  standalone: true,
  imports: [],
  templateUrl: './billing-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BillingConfigComponent {}
