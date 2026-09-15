import { HttpErrorResponse } from '@angular/common/http';
import { mapHttpErrorToUserMessage } from './map-http-error-to-user-message';

describe('mapHttpErrorToUserMessage', () => {
  it('prefers string message from the API body', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'El email ya está en uso' },
    });

    expect(mapHttpErrorToUserMessage(error)).toBe('El email ya está en uso');
  });

  it('joins array validation messages', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: ['Campo requerido', 'Formato inválido'] },
    });

    expect(mapHttpErrorToUserMessage(error)).toBe('Campo requerido; Formato inválido');
  });

  it('uses string body when error.error is a string', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: 'Payload inválido',
    });

    expect(mapHttpErrorToUserMessage(error)).toBe('Payload inválido');
  });

  it('falls back by status when body has no message', () => {
    expect(
      mapHttpErrorToUserMessage(new HttpErrorResponse({ status: 0, error: null })),
    ).toContain('conexión');
    expect(
      mapHttpErrorToUserMessage(new HttpErrorResponse({ status: 403, error: {} })),
    ).toContain('permiso');
    expect(
      mapHttpErrorToUserMessage(new HttpErrorResponse({ status: 404, error: {} })),
    ).toContain('disponible');
    expect(
      mapHttpErrorToUserMessage(new HttpErrorResponse({ status: 409, error: {} })),
    ).toContain('conflicto');
  });

  it('never returns Angular raw Http failure strings', () => {
    const error = new Error('Http failure response for http://localhost:3000/users: 500 OK');
    expect(mapHttpErrorToUserMessage(error, 'Acción fallida')).toBe('Acción fallida');
  });

  it('returns Error.message when it is a business-facing string', () => {
    expect(mapHttpErrorToUserMessage(new Error('Rol en uso'))).toBe('Rol en uso');
  });
});
