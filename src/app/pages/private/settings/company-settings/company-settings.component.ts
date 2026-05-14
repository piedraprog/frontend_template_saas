import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { CompanyApiService } from '../../../../core/services/company-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    ToastModule,
    PageHeaderComponent,
  ],
  templateUrl: './company-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CompanySettingsComponent implements OnInit {
  private readonly companyApi = inject(CompanyApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly companyId = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    logo: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.companyApi.getMyCompany().subscribe({
      next: (c) => {
        this.companyId.set(c.id);
        this.form.patchValue({ name: c.name, logo: c.logo ?? '' });
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Empresa',
          detail: err.message ?? 'No se pudo cargar la información.',
        });
      },
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (!this.companyId()) return;
    const { name, logo } = this.form.getRawValue();
    this.saving.set(true);
    this.companyApi.updateMyCompany({ name: name.trim(), logo: logo.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Empresa',
          detail: 'Datos actualizados.',
        });
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Empresa',
          detail: err.message ?? 'No se pudo guardar.',
        });
      },
    });
  }
}
