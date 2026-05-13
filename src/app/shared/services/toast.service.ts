import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

const DEFAULT_TOAST_OPTIONS = {
  life: 5200,
  closable: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(detail: string, summary: string | undefined = 'Éxito'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      ...DEFAULT_TOAST_OPTIONS,
    });
  }

  warn(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: detail ?? '',
      ...DEFAULT_TOAST_OPTIONS,
    });
  }

  error(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: summary ?? 'Error',
      detail,
      ...DEFAULT_TOAST_OPTIONS,
    });
  }

  info(detail: string, summary = 'Información'): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      ...DEFAULT_TOAST_OPTIONS,
    });
  }
}
