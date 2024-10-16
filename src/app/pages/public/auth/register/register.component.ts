import { JsonPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { LoaderDialogComponent } from '../../../../shared/components/loader-dialog/loader-dialog.component';
import { passwordMatcherValidator } from '../../../../shared/validators/password-matcher';
import { RegexUtils } from '../../../../shared/utils/regex.utils';
import { passwordValidator } from '../../../../shared/validators/password-validator';
import { CaptchaService } from '../../../../shared/services/captcha.service';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { environment } from '../../../../../environments/environment.development';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterInterface } from '../../../../shared/interfaces/register.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    NgIf,
    AuthCardComponent,
    LoaderDialogComponent,
    RouterModule,
    JsonPipe,
    NgxTurnstileModule,
  ],
  providers: [],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private captchaService = inject(CaptchaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  disableButton = true;

  public siteKey = environment.captcha_key;
  captchaToken: string = '';

  public registerForm = new FormGroup(
    {
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
    },
    {
      updateOn: 'blur',
      validators: [passwordMatcherValidator],
    },
  );

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
      };

      this.authService.register(data).subscribe({
        next: () => {
          // redirect to dashboard
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }
}
