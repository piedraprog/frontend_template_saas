import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import {
  OnboardingStateInterface,
  OnboardingViewModelInterface,
} from '../models/interfaces/onboarding.interface';
import { PlansService } from './plans.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly plansService = inject(PlansService);
  private readonly apiUrl = environment.apiUrl;

  loadState(): Observable<OnboardingStateInterface> {
    return this.http
      .get<ApiResponse<OnboardingStateInterface>>(`${this.apiUrl}/billing/onboarding/state`)
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo cargar el onboarding');
        }),
      );
  }

  loadViewModel(): Observable<OnboardingViewModelInterface> {
    return forkJoin({
      state: this.loadState(),
      plans: this.plansService.getPlans(),
    }).pipe(
      map(({ state, plans }) => ({
        state,
        plans: (plans ?? []).filter((plan) => plan.isActive !== false),
      })),
    );
  }

  updateProgress(stepId: string): Observable<OnboardingStateInterface> {
    return this.http
      .post<ApiResponse<OnboardingStateInterface>>(`${this.apiUrl}/billing/onboarding/progress`, {
        stepId,
      })
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo actualizar el onboarding');
        }),
      );
  }

  complete(): Observable<OnboardingStateInterface> {
    return this.http
      .post<ApiResponse<OnboardingStateInterface>>(`${this.apiUrl}/billing/onboarding/complete`, {})
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo completar el onboarding');
        }),
      );
  }

  chooseLater(): Observable<OnboardingStateInterface> {
    return this.http
      .post<
        ApiResponse<OnboardingStateInterface>
      >(`${this.apiUrl}/billing/onboarding/choose-later`, {})
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo activar la opción de decidir después');
        }),
      );
  }

  activatePlanSelection(planId: string): Observable<OnboardingStateInterface> {
    return this.http
      .post<
        ApiResponse<OnboardingStateInterface>
      >(`${this.apiUrl}/billing/onboarding/activate-plan`, { planId })
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo activar el plan seleccionado');
        }),
      );
  }
}
