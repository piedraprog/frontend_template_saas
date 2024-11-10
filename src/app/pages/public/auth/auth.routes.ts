import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { SuccessRegisterComponent } from './success-register/success-register.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'recovery',
    component: RecoverPasswordComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'success',
    component: SuccessRegisterComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  },
];
