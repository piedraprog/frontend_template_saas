import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly isVisibleSignal = signal(false);
  readonly isVisible = this.isVisibleSignal.asReadonly();

  showLoader() {
    this.isVisibleSignal.set(true);
  }

  hideLoader() {
    this.isVisibleSignal.set(false);
  }
}
