import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Función para validar la contraseña con diferentes requisitos
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si no hay valor, no es inválido, solo vacío.
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;

    const passwordValid =
      hasUpperCase && hasLowerCase && hasNumeric && hasSpecialCharacter && hasMinLength;

    return !passwordValid
      ? {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialCharacter,
            hasMinLength,
          },
        }
      : null;
  };
}
