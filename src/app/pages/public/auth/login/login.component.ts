import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { LoaderDialogComponent } from '../../../../shared/components/loader-dialog/loader-dialog.component';
import { RouterModule } from '@angular/router';

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
  showLoader: boolean = false;

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
    console.log(this.showLoader);
    if (this.loginForm.valid) {
      this.showLoader = true;
      console.log(this.loginForm.value);
    }
  }
}
