import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    AuthCardComponent,
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  isSubmitting = false;
  requestSent = false;
  submitAttempted = false;

  readonly genericResponseMessage =
    'Si el correo existe en nuestra plataforma, recibirás instrucciones para restablecer tu contraseña.';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get emailControl(): AbstractControl | null {
    return this.form.get('email');
  }

  showEmailError(): boolean {
    return Boolean(
      !this.isSubmitting &&
        this.emailControl?.invalid &&
        (this.emailControl.touched || this.submitAttempted),
    );
  }

  submit() {
    this.submitAttempted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.authService
      .requestPasswordReset(this.form.value.email!)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.submitAttempted = false;
          this.requestSent = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Revisa tu correo',
            detail: response.message,
          });
        },
        error: () => {
          this.submitAttempted = false;
          this.requestSent = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Revisa tu correo',
            detail: this.genericResponseMessage,
          });
        },
      });
  }

  useAnotherEmail() {
    this.requestSent = false;
    this.submitAttempted = false;
    this.form.markAsUntouched();
  }
}
