import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HelpApiService } from '../../../../core/services/api/help/help-api.service';
import {
  HelpPreferencesUpdate,
  ReleaseNoteInterface,
} from '../../../../core/models/help/help.interface';
import { HelpStateService } from '../../../../core/services/state/help/help-state.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PageLoadingSkeletonComponent } from '../../../../shared/components/page-loading-skeleton/page-loading-skeleton.component';
import { PrimengModule } from '../../../../shared/modules/primeng.module';

@Component({
  selector: 'app-whats-new',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    PageLoadingSkeletonComponent,
    PrimengModule,
    ReactiveFormsModule,
  ],
  templateUrl: './whats-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WhatsNewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly helpApi = inject(HelpApiService);
  private readonly helpState = inject(HelpStateService);
  private readonly router = inject(Router);

  readonly notes = signal<ReleaseNoteInterface[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly acknowledging = signal(false);
  readonly savingPreference = signal(false);
  readonly progress = this.helpState.progress;
  readonly autoOpenControl = new FormControl(true, { nonNullable: true });
  readonly autoStartScreenGuidesControl = new FormControl(false, { nonNullable: true });
  readonly guidedHelpPausedControl = new FormControl(false, { nonNullable: true });

  constructor() {
    effect(() => {
      const progress = this.progress();
      if (!progress) {
        return;
      }
      if (progress.autoOpenWhatsNew !== this.autoOpenControl.value) {
        this.autoOpenControl.setValue(progress.autoOpenWhatsNew, { emitEvent: false });
      }
      if (progress.autoStartScreenGuides !== this.autoStartScreenGuidesControl.value) {
        this.autoStartScreenGuidesControl.setValue(progress.autoStartScreenGuides, {
          emitEvent: false,
        });
      }
      if (progress.guidedHelpPaused !== this.guidedHelpPausedControl.value) {
        this.guidedHelpPausedControl.setValue(progress.guidedHelpPaused, { emitEvent: false });
      }
    });
    effect(() => {
      const latest = this.notes()[0];
      if (latest) {
        queueMicrotask(() => this.markLatestAsRead(latest));
      }
    });
  }

  ngOnInit(): void {
    this.autoOpenControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        this.savePreference({ autoOpenWhatsNew: enabled });
      });
    this.autoStartScreenGuidesControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        this.savePreference({ autoStartScreenGuides: enabled });
      });
    this.guidedHelpPausedControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paused) => {
        this.savePreference({ guidedHelpPaused: paused });
      });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.helpApi.listReleaseNotes().subscribe({
      next: ({ items }) => {
        this.notes.set(items);
        this.loading.set(false);
        this.markLatestAsRead(items[0]);
      },
      error: () => {
        this.notes.set([]);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  markLatestAsRead(latest: ReleaseNoteInterface | undefined): void {
    const progress = this.helpState.progress();
    if (
      !latest ||
      !progress?.hasUnseen ||
      progress.latest?.id !== latest.id ||
      this.acknowledging()
    ) {
      return;
    }

    this.acknowledging.set(true);
    this.helpState.markReleaseSeen(latest.id).subscribe({
      next: () => this.acknowledging.set(false),
      error: () => this.acknowledging.set(false),
    });
  }

  goBack(): void {
    void this.router.navigateByUrl('/settings');
  }

  private savePreference(prefs: HelpPreferencesUpdate): void {
    this.savingPreference.set(true);
    this.helpState.updatePreferences(prefs).subscribe({
      next: () => this.savingPreference.set(false),
      error: () => this.savingPreference.set(false),
    });
  }

  publishedDate(value: string | null): string {
    if (!value) {
      return '';
    }
    return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(value));
  }
}
