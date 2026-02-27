import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addon } from '../../../../../../core/models/plan.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-addon-list',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './addon-list.component.html',
  styleUrls: ['./addon-list.component.scss'],
})
export class AddonListComponent {
  addons = input.required<Addon[]>();
  buy = output<Addon>();

  handleBuy(addon: Addon) {
    this.buy.emit(addon);
  }

  formatFeature(slug: string): string {
    return slug
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
