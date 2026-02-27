import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { PrimengModule } from '../../../../../../shared/modules/primeng.module';
import { CustomRole } from '../../../../../../core/services/roles.service';
import { AdminUserService } from '../../../../../../core/services/admin-user.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { PlansService } from '../../../../../../core/services/plans.service';
import {
  getErrorMessage,
  VALIDATION_MESSAGES,
} from '../../../../../../core/utils/validation-messages';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PrimengModule],
  templateUrl: './user-create-modal.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateModalComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private cookieService = inject(CookieService);
  private plansService = inject(PlansService);

  @Input() visible = false;
  @Input() roles: CustomRole[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() userCreated = new EventEmitter<void>();

  loading = signal(false);
  membersLimitExceeded = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      const companyId = this.cookieService.get('teamId');
      if (companyId) {
        this.plansService.getSubscriptionSummary(companyId).subscribe({
          next: (res) => this.membersLimitExceeded.set(res.usage?.max_members?.exceeded === true),
          error: () => this.membersLimitExceeded.set(false),
        });
      } else {
        this.membersLimitExceeded.set(false);
      }
    }
  }

  // Expose validation utils to template
  protected readonly getErrorMessage = getErrorMessage;
  protected readonly VALIDATION_MESSAGES = VALIDATION_MESSAGES;

  createForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    customRoleId: [null, [Validators.required]],
  });

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.createForm.reset();
  }

  onSubmit() {
    if (this.membersLimitExceeded()) {
      this.toastService.warn(
        'Límite de miembros alcanzado',
        'Actualiza tu plan para invitar más usuarios.',
      );
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.createForm.value;
    const companyId = this.cookieService.get('teamId');

    this.adminUserService
      .createUser({
        username: formValue.username,
        email: formValue.email,
        companyId: companyId,
        customRoleId: formValue.customRoleId,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('Usuario creado correctamente');
          this.userCreated.emit();
          this.onHide();
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
          const isLimitError = error?.status === 403 && error?.error?.error === 'LimitExceeded';
          this.toastService.error(
            isLimitError ? 'Límite del plan alcanzado' : 'No se pudo crear el usuario',
            isLimitError ? 'Actualiza tu plan para invitar más miembros.' : undefined,
          );
        },
      });
  }
}
