import { AbstractControl } from '@angular/forms';

export const VALIDATION_MESSAGES: Record<string, string> = {
  required: 'Este campo es obligatorio',
  email: 'Introduce un correo válido',
  minlength: 'Longitud demasiado corta',
};

export function getErrorMessage(
  control: AbstractControl | null,
  messages: Record<string, string> = VALIDATION_MESSAGES,
): string {
  if (!control?.errors || !control.touched) {
    return '';
  }
  const firstKey = Object.keys(control.errors)[0];
  return messages[firstKey] ?? 'Valor no válido';
}
