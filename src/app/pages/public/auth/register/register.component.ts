import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { passwordMatcherValidator } from '../../../../shared/validators/password-matcher';
import { RegexUtils } from '../../../../shared/utils/regex.utils';
import { passwordValidator } from '../../../../shared/validators/password-validator';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterInterface } from '../../../../shared/interfaces/register.interface';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { CaptchaService } from '../../../../shared/services/captcha.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    AuthCardComponent,
    RouterModule,
    PasswordModule,
    CheckboxModule,
    ToastModule,
    NgxTurnstileModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private captchaService = inject(CaptchaService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  readonly captchaEnabled = Boolean(environment.captcha_key?.trim());
  readonly siteKey = environment.captcha_key ?? '';

  isSubmitting = false;
  submitAttempted = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  captchaToken = '';
  captchaReady = !this.captchaEnabled;

  public registerForm = new FormGroup(
    {
      corporation: new FormControl<string>('', [
        Validators.pattern(RegexUtils.CompanyNameRegx),
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.required,
      ]),
      username: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(RegexUtils.UsernameRegx),
      ]),
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator(),
      ]),
      confirmPassword: new FormControl<string>('', [Validators.required]),
      termsCondition: new FormControl<boolean>(false, [Validators.requiredTrue]),
    },
    {
      updateOn: 'change',
      validators: [passwordMatcherValidator],
    },
  );

  get isRegisterDisabled(): boolean {
    return (
      this.registerForm.invalid || this.isSubmitting || (this.captchaEnabled && !this.captchaReady)
    );
  }

  get corporationFormField() {
    return this.registerForm.get('corporation');
  }

  get usernameFormField() {
    return this.registerForm.get('username');
  }

  get emailFormField() {
    return this.registerForm.get('email');
  }

  get confirmPasswordFormField() {
    return this.registerForm.get('confirmPassword');
  }

  get confirmPasswordErrors() {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    return confirmPasswordControl?.errors?.['misMatch'] || null;
  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  get passwordErrors() {
    const passwordControl = this.registerForm.get('password');
    return passwordControl?.errors?.['passwordStrength'] || null;
  }

  get termsConditionFormField() {
    return this.registerForm.get('termsCondition');
  }

  showControlError(control: AbstractControl | null): boolean {
    return Boolean(
      !this.isSubmitting && control?.invalid && (control.touched || this.submitAttempted),
    );
  }

  showMismatchError(): boolean {
    return Boolean(
      !this.isSubmitting && this.registerForm.errors?.['misMatch'] && this.submitAttempted,
    );
  }

  onCaptchaResolved(captchaResponse: string | null): void {
    if (!this.captchaEnabled) {
      this.captchaReady = true;
      return;
    }

    if (!captchaResponse) {
      this.captchaToken = '';
      this.captchaReady = false;
      return;
    }

    this.captchaService.confirmCaptcha(captchaResponse).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.captchaToken = captchaResponse;
          this.captchaReady = true;
        } else {
          this.captchaToken = '';
          this.captchaReady = false;
        }
      },
      error: () => {
        this.captchaToken = '';
        this.captchaReady = false;
      },
    });
  }

  register() {
    this.submitAttempted = true;
    this.registerForm.markAllAsTouched();

    if (
      !this.registerForm.valid ||
      this.isSubmitting ||
      (this.captchaEnabled && !this.captchaReady)
    ) {
      return;
    }

    const data: RegisterInterface = {
      username: this.registerForm.value.username!.trim(),
      email: this.registerForm.value.email!.trim(),
      password: this.registerForm.value.password!,
      company: this.registerForm.value.corporation!.trim(),
      ...(this.captchaEnabled && this.captchaToken ? { captchaToken: this.captchaToken } : {}),
    };
    this.isSubmitting = true;
    this.authService
      .register(data)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.submitAttempted = false;
          this.router.navigate(['/success']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo crear la cuenta',
            detail: error?.error?.message ?? error?.message ?? 'Intenta nuevamente.',
          });
        },
      });
  }

  passwordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }

  confirmPasswordToggle() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
