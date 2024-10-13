import { Component } from '@angular/core';
import { AuthCardComponent } from '../../../../shared/components/auth-card/auth-card.component';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { LoaderDialogComponent } from '../../../../shared/components/loader-dialog/loader-dialog.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [
    AuthCardComponent,
    NgIf,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    RouterModule,
    LoaderDialogComponent,
    ConfirmDialogModule,
    ToastModule,
  ],
  templateUrl: './recover-password.component.html',
  providers: [ConfirmationService, MessageService],
})
export class RecoverPasswordComponent {
  showLoader: boolean = false;
  public recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  recoveryPassword() {
    if (this.recoveryForm.valid) {
      // this.showLoader = true;
      console.log(this.recoveryForm.value);

      this.confirmationService.confirm({
        message: 'Are you sure that you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text ',
        accept: () => {
          this.router.navigate(['/login']);
        },
        reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Rejected',
            detail: 'You have rejected',
          });
        },
      });
    }
  }
}
