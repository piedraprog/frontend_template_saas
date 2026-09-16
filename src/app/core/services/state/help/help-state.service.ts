import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, finalize, tap } from 'rxjs';
import {
  HelpPreferencesUpdate,
  HelpProgressInterface,
} from '../../../models/help/help.interface';
import { HelpApiService } from '../../api/help/help-api.service';
import { ContextualHelpTourService } from '../../ui/contextual-help-tour.service';

export type HelpPanelMode = 'whats-new' | 'help';

@Injectable({ providedIn: 'root' })
export class HelpStateService {
  private readonly helpApi = inject(HelpApiService);
  private readonly tours = inject(ContextualHelpTourService);
  private readonly router = inject(Router);
  private initialized = false;
  private routeAutoStartBound = false;
  private panelTrigger: HTMLElement | null = null;

  private readonly progressSignal = signal<HelpProgressInterface | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly panelSignal = signal<HelpPanelMode | null>(null);

  readonly progress = this.progressSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly panel = this.panelSignal.asReadonly();

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.bindRouteAutoStart();
    this.loadingSignal.set(true);
    this.helpApi
      .getMyProgress()
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (progress) => {
          this.applyProgress(progress);
          if (progress.shouldAutoOpenWhatsNew) {
            this.openPanel('whats-new');
          } else {
            window.setTimeout(() => this.tours.maybeStartPlatformMap(), 0);
          }
        },
        error: () => {
          this.tours.setProgressUnavailable();
        },
      });
  }

  openPanel(mode: HelpPanelMode, trigger?: HTMLElement): void {
    if (trigger) {
      this.panelTrigger = trigger;
    }
    this.tours.closeActiveTour();
    this.panelSignal.set(mode);
  }

  closePanel(): void {
    this.panelSignal.set(null);
    window.setTimeout(() => this.panelTrigger?.focus(), 0);
  }

  updatePreferences(prefs: HelpPreferencesUpdate): Observable<HelpProgressInterface> {
    return this.helpApi
      .updatePreferences(prefs)
      .pipe(tap((progress) => this.applyProgress(progress)));
  }

  /** @deprecated Prefer updatePreferences({ autoOpenWhatsNew }) */
  updateAutoOpenWhatsNew(enabled: boolean): Observable<HelpProgressInterface> {
    return this.updatePreferences({ autoOpenWhatsNew: enabled });
  }

  markReleaseSeen(releaseNoteId: string): Observable<HelpProgressInterface> {
    return this.helpApi
      .markReleaseSeen(releaseNoteId)
      .pipe(tap((progress) => this.applyProgress(progress)));
  }

  acknowledgeLatestAndContinue(): Observable<HelpProgressInterface> | null {
    const latest = this.progressSignal()?.latest;
    if (!latest) {
      this.closePanel();
      window.setTimeout(() => this.tours.maybeStartPlatformMap(), 0);
      return null;
    }

    return this.markReleaseSeen(latest.id).pipe(
      tap(() => {
        this.closePanel();
        window.setTimeout(() => this.tours.maybeStartPlatformMap(), 0);
      }),
    );
  }

  private bindRouteAutoStart(): void {
    if (this.routeAutoStartBound) {
      return;
    }
    this.routeAutoStartBound = true;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Default prefs keep this a no-op; opt-in starts Driver quietly (no invite modal).
        this.tours.maybeStartForUrl(event.urlAfterRedirects);
      });
  }

  private applyProgress(progress: HelpProgressInterface): void {
    this.progressSignal.set(progress);
    this.tours.setGuideProgress(progress.dismissedTourKeys, progress.completedTourKeys ?? []);
    this.tours.setHelpPreferences({
      autoStartScreenGuides: progress.autoStartScreenGuides ?? false,
      guidedHelpPaused: progress.guidedHelpPaused ?? false,
    });
  }
}
