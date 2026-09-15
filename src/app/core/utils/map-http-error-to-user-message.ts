import { HttpErrorResponse } from '@angular/common/http';

function firstNonEmptyString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
    return parts.length > 0 ? parts.join('; ') : null;
  }

  return null;
}

function asRecord(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  return body as Record<string, unknown>;
}

function extractBodyMessage(body: unknown): string | null {
  if (typeof body === 'string') {
    return firstNonEmptyString(body);
  }

  const record = asRecord(body);
  if (!record) {
    return null;
  }

  return (
    firstNonEmptyString(record['message']) ??
    firstNonEmptyString(record['error']) ??
    firstNonEmptyString(record['detail'])
  );
}

function fallbackForStatus(status: number, fallback: string): string {
  if (status === 0) {
    return 'No hay conexión. Revisa tu red e intenta de nuevo.';
  }
  if (status === 403) {
    return 'No tienes permiso para esta acción.';
  }
  if (status === 404) {
    return 'El recurso ya no está disponible. Actualiza e intenta de nuevo.';
  }
  if (status === 409) {
    return 'Hay un conflicto con el estado actual. Revisa e intenta de nuevo.';
  }
  if (status >= 500) {
    return 'El servidor no pudo completar la acción. Intenta de nuevo en un momento.';
  }
  return fallback;
}

/**
 * Maps API/HTTP failures to a user-facing Spanish message.
 * Prefer the backend business `message`; never surface Angular's raw Http failure string.
 */
export function mapHttpErrorToUserMessage(
  error: unknown,
  fallback = 'No se pudo completar la acción.',
): string {
  if (error instanceof HttpErrorResponse) {
    const fromBody = extractBodyMessage(error.error);
    if (fromBody) {
      return fromBody;
    }
    return fallbackForStatus(error.status, fallback);
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (
      message.length > 0 &&
      !message.startsWith('Http failure response for') &&
      !/^HTTP_\d+$/.test(message)
    ) {
      return message;
    }
  }

  return fallback;
}
