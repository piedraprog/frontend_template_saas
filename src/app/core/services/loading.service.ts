import { computed, Injectable, signal } from '@angular/core';

export type LoadingBehavior = 'silent' | 'page' | 'blocking';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly pageRequests = signal(0);
  private readonly blockingRequests = signal(0);
  private readonly scopeCounts = signal<Record<string, number>>({});
  private readonly pageVisibleSignal = signal(false);
  private readonly blockingVisibleSignal = signal(false);

  private pageShowTimer: ReturnType<typeof setTimeout> | null = null;
  private pageHideTimer: ReturnType<typeof setTimeout> | null = null;
  private blockingShowTimer: ReturnType<typeof setTimeout> | null = null;
  private blockingHideTimer: ReturnType<typeof setTimeout> | null = null;
  private pageVisibleSince = 0;
  private blockingVisibleSince = 0;

  readonly isPageVisible = this.pageVisibleSignal.asReadonly();
  readonly isBlockingVisible = this.blockingVisibleSignal.asReadonly();
  readonly isVisible = computed(() => this.isPageVisible() || this.isBlockingVisible());

  start(behavior: LoadingBehavior = 'silent', scope = 'global'): () => void {
    if (behavior === 'silent') {
      return () => undefined;
    }

    this.incrementScope(scope);

    if (behavior === 'blocking') {
      this.blockingRequests.update((count) => count + 1);
      this.scheduleShow('blocking');
    } else {
      this.pageRequests.update((count) => count + 1);
      this.scheduleShow('page');
    }

    let finished = false;

    return () => {
      if (finished) return;
      finished = true;

      this.decrementScope(scope);

      if (behavior === 'blocking') {
        this.blockingRequests.update((count) => Math.max(0, count - 1));
        this.scheduleHide('blocking');
      } else {
        this.pageRequests.update((count) => Math.max(0, count - 1));
        this.scheduleHide('page');
      }
    };
  }

  isScopeActive(scope: string): boolean {
    return (this.scopeCounts()[scope] ?? 0) > 0;
  }

  showLoader(behavior: LoadingBehavior = 'blocking', scope = 'global') {
    return this.start(behavior, scope);
  }

  hideLoader() {
    this.pageRequests.set(0);
    this.blockingRequests.set(0);
    this.scopeCounts.set({});
    this.clearTimer('pageShow');
    this.clearTimer('pageHide');
    this.clearTimer('blockingShow');
    this.clearTimer('blockingHide');
    this.pageVisibleSignal.set(false);
    this.blockingVisibleSignal.set(false);
  }

  private incrementScope(scope: string) {
    this.scopeCounts.update((counts) => ({
      ...counts,
      [scope]: (counts[scope] ?? 0) + 1,
    }));
  }

  private decrementScope(scope: string) {
    this.scopeCounts.update((counts) => {
      const nextCount = Math.max(0, (counts[scope] ?? 0) - 1);
      const next = { ...counts };

      if (nextCount === 0) {
        delete next[scope];
      } else {
        next[scope] = nextCount;
      }

      return next;
    });
  }

  private scheduleShow(kind: 'page' | 'blocking') {
    const requests = kind === 'page' ? this.pageRequests : this.blockingRequests;
    const visible = kind === 'page' ? this.pageVisibleSignal : this.blockingVisibleSignal;

    if (visible() || requests() === 0) return;

    this.clearTimer(`${kind}Hide`);
    this.clearTimer(`${kind}Show`);

    const delay = kind === 'blocking' ? 120 : 180;
    this.setTimer(
      `${kind}Show`,
      () => {
        if (requests() === 0) return;
        visible.set(true);
        if (kind === 'page') {
          this.pageVisibleSince = Date.now();
        } else {
          this.blockingVisibleSince = Date.now();
        }
      },
      delay,
    );
  }

  private scheduleHide(kind: 'page' | 'blocking') {
    const requests = kind === 'page' ? this.pageRequests : this.blockingRequests;
    const visible = kind === 'page' ? this.pageVisibleSignal : this.blockingVisibleSignal;

    if (requests() > 0) return;

    this.clearTimer(`${kind}Show`);

    if (!visible()) return;

    const visibleSince = kind === 'page' ? this.pageVisibleSince : this.blockingVisibleSince;
    const elapsed = Date.now() - visibleSince;
    const remaining = Math.max(0, 320 - elapsed);

    this.clearTimer(`${kind}Hide`);
    this.setTimer(
      `${kind}Hide`,
      () => {
        if (requests() === 0) {
          visible.set(false);
        }
      },
      remaining,
    );
  }

  private setTimer(
    key: 'pageShow' | 'pageHide' | 'blockingShow' | 'blockingHide',
    callback: () => void,
    delay: number,
  ) {
    const timer = setTimeout(callback, delay);

    if (key === 'pageShow') this.pageShowTimer = timer;
    if (key === 'pageHide') this.pageHideTimer = timer;
    if (key === 'blockingShow') this.blockingShowTimer = timer;
    if (key === 'blockingHide') this.blockingHideTimer = timer;
  }

  private clearTimer(key: 'pageShow' | 'pageHide' | 'blockingShow' | 'blockingHide') {
    const timer =
      key === 'pageShow'
        ? this.pageShowTimer
        : key === 'pageHide'
          ? this.pageHideTimer
          : key === 'blockingShow'
            ? this.blockingShowTimer
            : this.blockingHideTimer;

    if (timer) {
      clearTimeout(timer);
    }

    if (key === 'pageShow') this.pageShowTimer = null;
    if (key === 'pageHide') this.pageHideTimer = null;
    if (key === 'blockingShow') this.blockingShowTimer = null;
    if (key === 'blockingHide') this.blockingHideTimer = null;
  }
}
