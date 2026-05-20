import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import {
  UserProfileApiService,
  UpdateProfilePayload,
} from '../../../../core/services/user-profile-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile-config',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    PageHeaderComponent,
  ],
  templateUrl: './profile-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileConfigComponent implements OnInit {
  private readonly profileApi = inject(UserProfileApiService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  readonly saving = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly editing = signal(false);
  readonly user = computed(() => this.userService.userData());

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    currentPassword: new FormControl('', { nonNullable: true }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.resetFormToCurrentUser();
    this.form.disable({ emitEvent: false });
  }

  private resetFormToCurrentUser(): void {
    const currentUser = this.userService.userData();
    this.form.reset(
      {
        username: currentUser.username,
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      { emitEvent: false },
    );
  }

  enableEditing(): void {
    if (this.saving() || this.uploadingAvatar()) {
      return;
    }

    this.editing.set(true);
    this.resetFormToCurrentUser();
    this.form.enable({ emitEvent: false });
  }

  cancelEditing(): void {
    this.editing.set(false);
    this.resetFormToCurrentUser();
    this.form.disable({ emitEvent: false });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  onAvatarChange(event: Event): void {
    if (!this.editing()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Perfil',
        detail: 'Activa la edición para cambiar la foto o tus datos.',
      });
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|gif)$/i)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Archivo',
        detail: 'Solo imágenes JPG, PNG o GIF.',
      });
      return;
    }
    this.uploadingAvatar.set(true);
    this.profileApi.uploadAvatar(file).subscribe({
      next: () => {
        this.uploadingAvatar.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Avatar',
          detail: 'Imagen actualizada.',
        });
        void this.authService.getProfile().subscribe();
      },
      error: (err: Error) => {
        this.uploadingAvatar.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Avatar',
          detail: err.message ?? 'No se pudo subir la imagen.',
        });
      },
    });
  }

  save(): void {
    if (!this.editing()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.controls.username.invalid || this.form.controls.email.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const newPw = raw.newPassword?.trim() ?? '';
    const confirm = raw.confirmPassword?.trim() ?? '';
    if (newPw.length > 0) {
      if (newPw.length < 8) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Contraseña',
          detail: 'La nueva contraseña debe tener al menos 8 caracteres.',
        });
        return;
      }
      if (!raw.currentPassword) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Contraseña',
          detail: 'Indica tu contraseña actual para cambiarla.',
        });
        return;
      }
      if (newPw !== confirm) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Contraseña',
          detail: 'La confirmación no coincide.',
        });
        return;
      }
    }

    const body: UpdateProfilePayload = {
      username: raw.username.trim(),
      email: raw.email.trim(),
    };
    if (newPw.length > 0) {
      body.currentPassword = raw.currentPassword;
      body.password = newPw;
    }

    this.saving.set(true);
    this.form.disable({ emitEvent: false });
    this.profileApi.updateProfile(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil',
          detail: 'Cambios guardados.',
        });
        this.form.reset(
          {
            username: body.username ?? '',
            email: body.email ?? '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
          { emitEvent: false },
        );
        this.form.disable({ emitEvent: false });
        void this.authService.getProfile().subscribe();
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.form.enable({ emitEvent: false });
        this.messageService.add({
          severity: 'error',
          summary: 'Perfil',
          detail: err.message ?? 'No se pudo guardar.',
        });
      },
    });
  }
}
