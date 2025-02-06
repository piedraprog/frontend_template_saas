import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { passwordMatcherValidator } from '../../../../shared/validators/password-matcher';
import { RegexUtils } from '../../../../shared/utils/regex.utils';
import { passwordValidator } from '../../../../shared/validators/password-validator';
import { CaptchaService } from '../../../../shared/services/captcha.service';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { environment } from '../../../../../environments/environment.development';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterInterface } from '../../../../shared/interfaces/register.interface';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

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
    NgxTurnstileModule,
    PasswordModule,
    CheckboxModule,
  ],
  providers: [],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private captchaService = inject(CaptchaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  disableButton = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  public siteKey = environment.captcha_key;
  captchaToken: string = '';

  public registerForm = new FormGroup(
    {
      corporation: new FormControl<string>('', [
        Validators.pattern(RegexUtils.OnlyLettersRegx),
        Validators.minLength(5),
        Validators.maxLength(15),
        Validators.required,
      ]),
      username: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(RegexUtils.OnlyLettersRegx),
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

  confirmCaptcha(captchaResponse: string | null) {
    this.captchaService.confirmCaptcha(captchaResponse).subscribe({
      next: (isCaptchaValid: boolean | undefined) => {
        if (isCaptchaValid === true) {
          console.log('Captcha verified successfully');
          this.captchaToken = captchaResponse!;
          this.disableButton = false;
        } else if (isCaptchaValid === false) {
          console.error('Captcha verification failed');
          this.disableButton = true;
        } else {
          console.error('Captcha verification result is undefined');
          this.disableButton = true;
        }
      },
      error: (error: Error) => {
        console.error(error);
        this.disableButton = true;
      },
    });
  }

  register() {
    if (this.registerForm.valid) {
      const data: RegisterInterface = {
        username: this.registerForm.value.username!,
        email: this.registerForm.value.email!,
        password: this.registerForm.value.confirmPassword!,
        captchaToken: this.captchaToken,
        company: this.registerForm.value.corporation!,
        termsCondition: this.registerForm.value.termsCondition!,
      };
      this.authService.register(data).subscribe({
        next: () => {
          // redirect to dashboard
          this.router.navigate(['/success']);
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  passwordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }

  confirmPasswordToggle() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
