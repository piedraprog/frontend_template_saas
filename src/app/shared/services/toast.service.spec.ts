import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let toastService: ToastService;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [ToastService, { provide: MessageService, useValue: messageService }],
    });

    toastService = TestBed.inject(ToastService);
  });

  it('uses (detail, summary?) for warn like success/error/info', () => {
    toastService.warn('Actualiza tu plan', 'Límite alcanzado');
    toastService.success('Usuario creado', 'Éxito');
    toastService.error('No se pudo guardar', 'Error');
    toastService.info('Revisa tu correo', 'Información');

    expect(messageService.add.calls.allArgs()).toEqual([
      [
        jasmine.objectContaining({
          severity: 'warn',
          detail: 'Actualiza tu plan',
          summary: 'Límite alcanzado',
        }),
      ],
      [
        jasmine.objectContaining({
          severity: 'success',
          detail: 'Usuario creado',
          summary: 'Éxito',
        }),
      ],
      [
        jasmine.objectContaining({
          severity: 'error',
          detail: 'No se pudo guardar',
          summary: 'Error',
        }),
      ],
      [
        jasmine.objectContaining({
          severity: 'info',
          detail: 'Revisa tu correo',
          summary: 'Información',
        }),
      ],
    ]);
  });
});
