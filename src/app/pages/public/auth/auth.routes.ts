import { Routes } from "@angular/router";
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { RecoverPasswordComponent } from "./recover-password/recover-password.component";

export const AUTH_ROUTES: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recovery', component: RecoverPasswordComponent },
  { path: '**', redirectTo: 'login' }

];