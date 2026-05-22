import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginInterface } from '../../../../shared/interfaces/login.interface';
import { IPService } from '../../../../core/services/ip.service';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    AuthCardComponent,
    RouterModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ipService = inject(IPService);
  private messageService = inject(MessageService);

  passwordVisible = false;
  isSubmitting = false;
  submitAttempted = false;
  ip: string = '';

  ngOnInit(): void {
    this.ipService.getUserIP().subscribe((response) => (this.ip = response));
  }

  public loginForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    },
    {
      updateOn: 'change',
    },
  );

  get emailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  showEmailError(): boolean {
    return Boolean(
      !this.isSubmitting &&
        this.emailControl?.invalid &&
        (this.emailControl.touched || this.submitAttempted),
    );
  }

  showPasswordError(): boolean {
    return Boolean(
      !this.isSubmitting &&
        this.passwordControl?.invalid &&
        (this.passwordControl.touched || this.submitAttempted),
    );
  }

  login() {
    this.submitAttempted = true;
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid && !this.isSubmitting) {
      const data: LoginInterface = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
        ip: this.ip,
      };

      this.isSubmitting = true;
      this.authService
        .login(data)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .pipe(
          switchMap((response) => {
            this.submitAttempted = false;
            this.authService.persistSessionMetadata(response.userId);
            return this.authService.getProfile();
          }),
        )
        .subscribe({
          next: (profile) => {
            const onboardingCompletedAt = profile.onboardingCompletedAt ?? null;
            const targetUrl = onboardingCompletedAt ? '/dashboard' : '/onboarding';

            void this.router.navigateByUrl(targetUrl);
          },
          error: (error: HttpErrorResponse) => {
            this.submitAttempted = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message ?? 'No se pudo iniciar sesión.',
            });
            this.loginForm.reset();
          },
        });
    }
  }

  passwordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }
}
