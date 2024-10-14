import { JsonPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { LoaderDialogComponent } from '../../../../shared/components/loader-dialog/loader-dialog.component';
import { passwordMatcherValidator } from '../../../../shared/validators/password-matcher';
import { RegexUtils } from '../../../../shared/utils/regex.utils';
import { passwordValidator } from '../../../../shared/validators/password-validator';
import { CaptchaService } from '../../../../shared/services/captcha.service';

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
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  showLoader = false;
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

  constructor(private captchaService: CaptchaService) {}

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

  confirmCaptcha() {
    this.captchaService.confirmCaptcha();
  }

  register() {
    this.showLoader = true;
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
    }
  }
}
