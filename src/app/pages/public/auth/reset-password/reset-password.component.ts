import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatcherValidator } from '../../../../shared/validators/password-matcher';
import { passwordValidator } from '../../../../shared/validators/password-validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    AuthCardComponent,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isSubmitting = false;
  token = '';
  tokenError = false;
  resetCompleted = false;
  submitAttempted = false;

  form = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator(),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatcherValidator },
  );

  get passwordControl(): AbstractControl | null {
    return this.form.get('password');
  }

  get confirmPasswordControl(): AbstractControl | null {
    return this.form.get('confirmPassword');
  }

  get hasUsableToken(): boolean {
    return this.token.trim().length > 0;
  }

  get passwordStrengthErrors(): {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumeric: boolean;
    hasSpecialCharacter: boolean;
    hasMinLength: boolean;
  } | null {
    return (
      (this.passwordControl?.errors?.['passwordStrength'] as {
        hasUpperCase: boolean;
        hasLowerCase: boolean;
        hasNumeric: boolean;
        hasSpecialCharacter: boolean;
        hasMinLength: boolean;
      } | null) ?? null
    );
  }

  showPasswordGuidance(): boolean {
    return Boolean(
      !this.isSubmitting &&
        this.passwordControl?.invalid &&
        (this.passwordControl.touched || this.submitAttempted),
    );
  }

  showPasswordMismatchError(): boolean {
    return Boolean(
      !this.isSubmitting &&
        this.form.errors?.['misMatch'] &&
        (this.form.touched || this.submitAttempted),
    );
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;

    if (isSubmitting) {
      this.form.disable({ emitEvent: false });
      return;
    }

    this.form.enable({ emitEvent: false });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const queryToken = params.get('token');
      const urlToken = this.readTokenFromCurrentUrl();
      this.token = (queryToken ?? urlToken ?? '').trim();

      if (!this.hasUsableToken) {
        this.tokenError = true;
        this.messageService.add({
          severity: 'warn',
          summary: 'Enlace inválido',
          detail: 'Solicita un nuevo restablecimiento de contraseña.',
        });
        return;
      }

      this.tokenError = false;
    });
  }

  private readTokenFromCurrentUrl(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const currentUrl = new URL(window.location.href);
      const searchToken = currentUrl.searchParams.get('token');
      if (searchToken) {
        return searchToken;
      }

      const hash = currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash;
      if (!hash) {
        return null;
      }

      const [, hashQuery = ''] = hash.split('?');
      if (!hashQuery) {
        return null;
      }

      return new URLSearchParams(hashQuery).get('token');
    } catch {
      return null;
    }
  }

  submit() {
    this.submitAttempted = true;
    this.form.markAllAsTouched();
    if (this.isSubmitting) {
      return;
    }

    if (!this.hasUsableToken) {
      this.tokenError = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Enlace inválido',
        detail: 'No encontramos el token de restablecimiento en el enlace.',
      });
      return;
    }

    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Revisa el formulario',
        detail: this.getInvalidFormMessage(),
      });
      return;
    }

    this.setSubmittingState(true);
    this.authService
      .resetPassword({ token: this.token, password: this.form.value.password! })
      .pipe(finalize(() => this.setSubmittingState(false)))
      .subscribe({
        next: (response) => {
          this.submitAttempted = false;
          this.resetCompleted = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: response.message,
          });
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 1200);
        },
        error: (error: { error?: { message?: string } }) => {
          this.submitAttempted = false;
          this.tokenError = true;
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo restablecer',
            detail: error.error?.message ?? 'El enlace no es válido o ha caducado.',
          });
        },
      });
  }

  private getInvalidFormMessage(): string {
    if (this.passwordControl?.errors?.['required']) {
      return 'La nueva contraseña es obligatoria.';
    }

    if (this.passwordStrengthErrors) {
      return 'La contraseña debe cumplir todos los requisitos indicados.';
    }

    if (this.confirmPasswordControl?.errors?.['required']) {
      return 'Debes confirmar la contraseña.';
    }

    if (this.form.errors?.['misMatch']) {
      return 'Las contraseñas no coinciden.';
    }

    return 'Verifica la información e inténtalo de nuevo.';
  }

  goToLogin() {
    if (this.isSubmitting) {
      return;
    }

    void this.router.navigateByUrl('/login');
  }

  goToForgotPassword() {
    if (this.isSubmitting) {
      return;
    }

    void this.router.navigateByUrl('/forgot-password');
  }
}
