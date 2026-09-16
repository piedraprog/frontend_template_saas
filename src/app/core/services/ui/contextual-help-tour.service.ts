import { inject, Injectable, signal } from '@angular/core';
import { driver, type DriveStep, type Driver } from 'driver.js';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Permission } from '../../models/enums/permission.enum';
import { PermissionService } from '../permission.service';
import { HelpApiService } from '../api/help/help-api.service';

type TourOutcome = 'dismissed' | 'completed';
type GuideKind = 'platform-map' | 'screen';

export interface HelpTourPreferences {
  autoStartScreenGuides: boolean;
  guidedHelpPaused: boolean;
}

interface GuideStepDefinition {
  selector: string | readonly string[];
  title: string;
  description: string;
  waitForElement?: number;
  skipMissingElement?: boolean;
  /** When set, step is omitted unless this guide id is visible. */
  requiresGuideId?: string;
}

interface SectionGuide {
  id: string;
  kind: GuideKind;
  visibilityId: string;
  matches: (url: string) => boolean;
  steps: readonly GuideStepDefinition[];
}

const HELP_REPLAY_HINT =
  ' Puedes cerrarlo ahora y volver a iniciarlo desde Ayuda cuando lo necesites.';

const LEGACY_DASHBOARD_INTRO_ID = 'dashboard-intro';
const PLATFORM_MAP_ID = 'platform-map';

const navigationTarget = (id: string): readonly string[] => [
  `[data-tour="desktop-navigation-${id}"]`,
  `[data-tour="mobile-navigation-${id}"]`,
];

const navigationStep = (
  id: string,
  title: string,
  description: string,
  requiresGuideId?: string,
): GuideStepDefinition => ({
  selector: navigationTarget(id),
  title,
  description,
  requiresGuideId,
  skipMissingElement: true,
});

/** A · Mapa del panel — top-level zones only (≤5). Whitelabel: sin dominio shops. */
const PLATFORM_MAP_STEPS: readonly GuideStepDefinition[] = [
  {
    selector: ['[data-tour="dashboard-intro-summary"]', ...navigationTarget('dashboard')],
    title: 'Inicio',
    description: 'Aquí ves el resumen general del panel y vuelves al punto de partida.',
  },
  navigationStep(
    'users',
    'Equipo',
    'Desde aquí administras usuarios y el acceso del equipo a la plataforma.',
    'users',
  ),
  navigationStep(
    'settings',
    'Configuración',
    'Opciones de tu cuenta, organización y preferencias del panel.',
  ),
  {
    selector: [...navigationTarget('help'), ...navigationTarget('whats-new')],
    title: 'Ayuda y Novedades',
    description:
      'En Ayuda puedes volver a recorrer el panel o esta pantalla. En Novedades ves qué cambió en el producto.',
  },
];

/** B · Guía de pantalla del dashboard (≤4). */
const DASHBOARD_SCREEN_STEPS: readonly GuideStepDefinition[] = [
  {
    selector: '[data-tour="dashboard-intro-summary"]',
    title: 'Resumen',
    description: 'Aquí tienes una lectura rápida del estado del panel.',
  },
  {
    selector: '[data-tour="dashboard-intro-kpis"]',
    title: 'Indicadores',
    description: 'Estos indicadores resumen actividad y métricas clave.',
  },
  {
    selector: '[data-tour="dashboard-intro-content"]',
    title: 'Contenido principal',
    description: 'Esta zona es el lugar para el flujo o listado principal de tu producto.',
  },
];

const SECTION_GUIDES: readonly SectionGuide[] = [
  {
    id: PLATFORM_MAP_ID,
    kind: 'platform-map',
    visibilityId: 'dashboard',
    matches: () => false,
    steps: PLATFORM_MAP_STEPS,
  },
  {
    id: 'dashboard-screen',
    kind: 'screen',
    visibilityId: 'dashboard',
    matches: (url) => url === '/dashboard',
    steps: DASHBOARD_SCREEN_STEPS,
  },
  {
    id: 'settings-intro',
    kind: 'screen',
    visibilityId: 'settings',
    matches: (url) => url === '/settings',
    steps: [
      {
        selector: '[data-tour="settings-intro-header"]',
        title: 'Configuración',
        description:
          'Administra las opciones de tu cuenta y organización, y revisa Novedades cuando necesites conocer cambios del panel.',
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class ContextualHelpTourService {
  private readonly helpApi = inject(HelpApiService);
  private readonly permissionService = inject(PermissionService);
  private activeDriver: Driver | null = null;
  private readonly dismissedTourKeys = signal<ReadonlySet<string>>(new Set());
  private readonly completedTourKeys = signal<ReadonlySet<string>>(new Set());
  private readonly pendingTourKeys = new Set<string>();
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private autoStartScreenGuides = false;
  private guidedHelpPaused = false;

  setGuideProgress(dismissedKeys: string[], completedKeys: string[]): void {
    this.dismissedTourKeys.set(new Set(dismissedKeys));
    this.completedTourKeys.set(new Set(completedKeys));
  }

  setHelpPreferences(prefs: HelpTourPreferences): void {
    this.autoStartScreenGuides = prefs.autoStartScreenGuides;
    this.guidedHelpPaused = prefs.guidedHelpPaused;
  }

  setProgressUnavailable(): void {
    this.dismissedTourKeys.set(new Set());
    this.completedTourKeys.set(new Set());
    this.autoStartScreenGuides = false;
    this.guidedHelpPaused = false;
  }

  hasScreenTourForUrl(url: string): boolean {
    return this.screenGuideForUrl(url) !== null;
  }

  hasPlatformMap(): boolean {
    return environment.contextualHelpToursEnabled && this.platformMapGuide() !== null;
  }

  canStartPlatformMap(): boolean {
    return this.hasPlatformMap() && !this.prefersReducedMotion();
  }

  /**
   * Screen auto-invite eligibility. Default prefs keep this false (pull-only).
   * Callers must not open countdown modals; use maybeStartForUrl for quiet Driver start.
   */
  shouldInviteForUrl(url: string): boolean {
    return this.isScreenGuideAutoEligible(url);
  }

  maybeStartForUrl(url: string): void {
    if (!this.isScreenGuideAutoEligible(url)) {
      return;
    }
    const guide = this.screenGuideForUrl(url);
    if (guide) {
      this.startGuide(guide);
    }
  }

  maybeStartPlatformMap(): void {
    if (!this.isPlatformMapAutoEligible()) {
      return;
    }
    const guide = this.platformMapGuide();
    if (guide) {
      this.startGuide(guide);
    }
  }

  startPlatformMap(): void {
    const guide = this.platformMapGuide();
    if (guide) {
      this.startGuide(guide);
    }
  }

  startTourForUrl(url: string): void {
    const guide = this.screenGuideForUrl(url);
    if (guide) {
      this.startGuide(guide);
    }
  }

  dismissTourForUrl(url: string): void {
    const guide = this.screenGuideForUrl(url);
    if (guide) {
      this.persistOutcome(guide.id, 'dismissed');
    }
  }

  closeActiveTour(): void {
    this.clearGuideTimers();
    this.activeDriver?.destroy();
  }

  private startGuide(guide: SectionGuide): void {
    if (
      !environment.contextualHelpToursEnabled ||
      this.activeDriver ||
      this.prefersReducedMotion()
    ) {
      return;
    }

    const steps = this.createSteps(this.filterSteps(guide.steps));
    if (steps.length === 0) {
      return;
    }

    let outcome: TourOutcome = 'dismissed';
    const closeAsDismissed = () => {
      outcome = 'dismissed';
      this.clearGuideTimers();
      this.activeDriver?.destroy();
    };
    this.activeDriver = driver({
      animate: true,
      overlayOpacity: 0.45,
      stagePadding: 8,
      showProgress: steps.length > 1,
      allowClose: true,
      nextBtnText: 'Siguiente',
      doneBtnText: 'Entendido',
      onNextClick: () => {
        this.clearGuideTimers();
        this.moveToAdjacentStep('next');
      },
      onPrevClick: () => {
        this.clearGuideTimers();
        this.moveToAdjacentStep('previous');
      },
      onDoneClick: () => {
        outcome = 'completed';
        this.clearGuideTimers();
        this.activeDriver?.destroy();
      },
      onCloseClick: closeAsDismissed,
      onDestroyed: () => {
        this.clearGuideTimers();
        this.persistOutcome(guide.id, outcome);
        this.activeDriver = null;
      },
      steps,
    });
    this.activeDriver.drive();
  }

  private createSteps(definitions: readonly GuideStepDefinition[]): DriveStep[] {
    return definitions.map(({ selector, title, description, waitForElement, skipMissingElement }) => ({
      element: () => this.findVisibleTarget(selector) as Element,
      waitForElement: waitForElement ?? 0,
      skipMissingElement: skipMissingElement ?? true,
      popover: {
        title,
        description: `${description}${HELP_REPLAY_HINT}`,
        side: 'bottom',
        align: 'start',
      },
    }));
  }

  private filterSteps(definitions: readonly GuideStepDefinition[]): GuideStepDefinition[] {
    const visible = this.visibleGuideIds();
    return definitions.filter((step) => {
      if (!step.requiresGuideId) {
        return true;
      }
      return visible.has(step.requiresGuideId);
    });
  }

  private moveToAdjacentStep(direction: 'next' | 'previous'): void {
    const driverInstance = this.activeDriver;
    if (!driverInstance) {
      return;
    }

    this.transitionTimer = window.setTimeout(() => {
      this.transitionTimer = null;
      if (direction === 'next') {
        driverInstance.moveNext();
      } else {
        driverInstance.movePrevious();
      }
    }, 0);
  }

  private clearGuideTimers(): void {
    if (this.transitionTimer !== null) {
      window.clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  private findVisibleTarget(selector: string | readonly string[]): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const candidate of selectors) {
      const element = Array.from(document.querySelectorAll<HTMLElement>(candidate)).find(
        (target) => {
          const style = window.getComputedStyle(target);
          return style.display !== 'none' && style.visibility !== 'hidden';
        },
      );
      if (element) {
        return element;
      }
    }

    return null;
  }

  private persistOutcome(tourId: string, outcome: TourOutcome): void {
    if (this.pendingTourKeys.has(tourId)) {
      return;
    }

    this.pendingTourKeys.add(tourId);
    if (outcome === 'completed') {
      this.helpApi
        .completeTour(tourId)
        .pipe(finalize(() => this.pendingTourKeys.delete(tourId)))
        .subscribe({
          next: (progress) => this.completedTourKeys.set(new Set(progress.completedTourKeys)),
          error: () => undefined,
        });
      return;
    }

    this.helpApi
      .dismissTour(tourId)
      .pipe(finalize(() => this.pendingTourKeys.delete(tourId)))
      .subscribe({
        next: (progress) => this.dismissedTourKeys.set(new Set(progress.dismissedTourKeys)),
        error: () => undefined,
      });
  }

  private isScreenGuideAutoEligible(url: string): boolean {
    if (!this.autoStartScreenGuides || this.guidedHelpPaused) {
      return false;
    }
    if (!environment.contextualHelpToursEnabled || this.prefersReducedMotion()) {
      return false;
    }
    if (this.activeDriver) {
      return false;
    }
    const guide = this.screenGuideForUrl(url);
    if (!guide) {
      return false;
    }
    return !this.isTourSettled(guide.id);
  }

  private isPlatformMapAutoEligible(): boolean {
    if (this.guidedHelpPaused) {
      return false;
    }
    if (!this.canStartPlatformMap() || this.activeDriver) {
      return false;
    }
    if (this.isTourSettled(PLATFORM_MAP_ID)) {
      return false;
    }
    // Legacy: dashboard-intro completed/dismissed counts as map already done.
    if (this.isTourSettled(LEGACY_DASHBOARD_INTRO_ID)) {
      return false;
    }
    return true;
  }

  private isTourSettled(tourId: string): boolean {
    return this.dismissedTourKeys().has(tourId) || this.completedTourKeys().has(tourId);
  }

  private platformMapGuide(): SectionGuide | null {
    const visibleGuideIds = this.visibleGuideIds();
    const guide = SECTION_GUIDES.find((entry) => entry.id === PLATFORM_MAP_ID);
    if (!guide || !visibleGuideIds.has(guide.visibilityId)) {
      return null;
    }
    return guide;
  }

  private screenGuideForUrl(url: string): SectionGuide | null {
    const path = this.normalizeUrl(url);
    const visibleGuideIds = this.visibleGuideIds();
    return (
      SECTION_GUIDES.find(
        (guide) =>
          guide.kind === 'screen' &&
          visibleGuideIds.has(guide.visibilityId) &&
          guide.matches(path),
      ) ?? null
    );
  }

  /** @internal Test access to catalog entries. */
  private guideById(id: string): SectionGuide | undefined {
    return SECTION_GUIDES.find((guide) => guide.id === id);
  }

  /** @internal Test alias matching previous private API. */
  private guideForUrl(url: string): SectionGuide | null {
    return this.screenGuideForUrl(url);
  }

  private visibleGuideIds(): ReadonlySet<string> {
    const ids = new Set<string>(['dashboard', 'settings']);
    if (this.permissionService.has(Permission.USERS_VIEW)) {
      ids.add('users');
    }
    return ids;
  }

  private normalizeUrl(url: string): string {
    const path = url.split('?')[0]?.split('#')[0] ?? '/';
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path || '/';
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
