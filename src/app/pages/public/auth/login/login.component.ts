import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { LoaderDialogComponent } from '../../../../shared/components/loader-dialog/loader-dialog.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginInterface } from '../../../../shared/interfaces/login.interface';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    NgIf,
    AuthCardComponent,
    LoaderDialogComponent,
    RouterModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cookieService = inject(CookieService);
  private router = inject(Router);

  public loginForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    },
    {
      updateOn: 'blur',
    },
  );

  login() {
    if (this.loginForm.valid) {
      const data: LoginInterface = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      };

      this.authService.login(data).subscribe({
        next: (response) => {
          this.cookieService.set('accessToken', response.accessToken);
          this.cookieService.set('refreshToken', response.refreshToken);

          // redirect to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }
}
