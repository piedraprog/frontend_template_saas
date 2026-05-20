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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimengModule } from '../../../../../../shared/modules/primeng.module';
import { CustomRole } from '../../../../../../core/services/roles/roles.service';
import { AdminUserService } from '../../../../../../core/services/admin-user.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { PlansService } from '../../../../../../core/services/plans.service';
import {
  getErrorMessage,
  VALIDATION_MESSAGES,
} from '../../../../../../core/utils/validation-messages';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimengModule],
  templateUrl: './user-create-modal.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateModalComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private plansService = inject(PlansService);

  @Input() visible = false;
  @Input() roles: CustomRole[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() userCreated = new EventEmitter<void>();

  loading = signal(false);
  membersLimitExceeded = signal(false);
  submitAttempted = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.submitAttempted.set(false);
      this.createForm.reset();
      this.createForm.enable({ emitEvent: false });
      this.plansService.getSubscriptionSummary().subscribe({
        next: (res) => this.membersLimitExceeded.set(res.usage?.max_members?.exceeded === true),
        error: () => this.membersLimitExceeded.set(false),
      });
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

  private setSubmittingState(isSubmitting: boolean): void {
    this.loading.set(isSubmitting);

    if (isSubmitting) {
      this.createForm.disable({ emitEvent: false });
      return;
    }

    this.createForm.enable({ emitEvent: false });
  }

  shouldShowError(controlName: 'username' | 'email' | 'customRoleId'): boolean {
    const control = this.createForm.get(controlName);
    return Boolean(control?.invalid && (control.touched || this.submitAttempted()));
  }

  onDialogVisibleChange(isVisible: boolean): void {
    if (isVisible) {
      return;
    }

    this.dismissModal();
  }

  dismissModal(): void {
    if (this.loading()) {
      return;
    }

    this.closeModal();
  }

  private closeModal(): void {
    this.visibleChange.emit(false);
    this.createForm.reset();
    this.submitAttempted.set(false);
    this.createForm.enable({ emitEvent: false });
  }

  onSubmit() {
    this.submitAttempted.set(true);

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

    const formValue = this.createForm.value;
    const username = String(formValue.username ?? '').trim();
    const email = String(formValue.email ?? '')
      .trim()
      .toLowerCase();
    const customRoleId = formValue.customRoleId ?? undefined;

    this.setSubmittingState(true);

    this.adminUserService
      .createUser({
        username,
        email,
        customRoleId,
      })
      .pipe(finalize(() => this.setSubmittingState(false)))
      .subscribe({
        next: () => {
          this.toastService.success('Usuario creado correctamente');
          this.userCreated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
          const isLimitError = error?.status === 403 && error?.error?.error === 'LimitExceeded';
          this.toastService.error(
            isLimitError ? 'Límite del plan alcanzado' : 'No se pudo crear el usuario',
            isLimitError ? 'Actualiza tu plan para invitar más miembros.' : undefined,
          );
          this.closeModal();
        },
      });
  }
}
