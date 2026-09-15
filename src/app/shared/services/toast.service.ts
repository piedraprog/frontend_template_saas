import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

const DEFAULT_TOAST_OPTIONS = {
  life: 4800,
  closable: true,
} as const;

const ATTENTION_TOAST_OPTIONS = {
  life: 7200,
  closable: true,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  /** Signature: (detail, summary?) — same order for success / error / info / warn. */
  success(detail: string, summary: string | undefined = 'Éxito'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      ...DEFAULT_TOAST_OPTIONS,
    });
  }

  warn(detail: string, summary: string | undefined = 'Atención'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      ...ATTENTION_TOAST_OPTIONS,
    });
  }

  error(detail: string, summary: string | undefined = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      ...ATTENTION_TOAST_OPTIONS,
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
