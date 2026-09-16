import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpProgressInterface } from '../../../core/models/help/help.interface';
import { HelpPanelMode } from '../../../core/services/state/help/help-state.service';
import { PrimengModule } from '../../modules/primeng.module';

@Component({
  selector: 'app-help-panel',
  standalone: true,
  imports: [CommonModule, PrimengModule],
  templateUrl: './help-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPanelComponent {
  readonly mode = input.required<HelpPanelMode>();
  readonly progress = input<HelpProgressInterface | null>(null);
  readonly acknowledging = input(false);
  readonly canStartScreenTour = input(false);
  readonly canStartPlatformMap = input(false);

  readonly close = output<void>();
  readonly acknowledge = output<void>();
  readonly startScreenTour = output<void>();
  readonly startPlatformMap = output<void>();
  readonly viewHistory = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    afterNextRender(() => {
      this.panel()?.nativeElement.focus();
    });
  }

  publishedDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(value));
  }

  closePanel(): void {
    this.close.emit();
  }
}
