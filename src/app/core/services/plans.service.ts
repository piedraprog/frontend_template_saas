import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { PlanInterface, AddonInterface } from '../models/interfaces/plan.interface';
import {
  SubscriptionInterface,
  SubscriptionSummary,
} from '../models/interfaces/subscription.interface';

export interface AddonPurchaseRequest {
  id: string;
  companyId: string;
  addonId: string;
  requestedByUserId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCurrentSubscription(): Observable<SubscriptionInterface> {
    return this.http
      .get<ApiResponse<SubscriptionInterface>>(`${this.apiUrl}/billing/subscription`)
      .pipe(
        map((response: ApiResponse<SubscriptionInterface>) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener la suscripción actual');
        }),
      );
  }

  getPlans(): Observable<PlanInterface[]> {
    return this.http.get<ApiResponse<PlanInterface[]>>(`${this.apiUrl}/plans`).pipe(
      map((response: ApiResponse<PlanInterface[]>) => {
        if (response.status && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener los planes');
      }),
    );
  }

  /** Addons deshabilitados hasta integrar pasarela. Descomentar cuando esté listo. */
  getAddons(): Observable<AddonInterface[]> {
    return this.http.get<ApiResponse<AddonInterface[]>>(`${this.apiUrl}/addons`).pipe(
      map((response: ApiResponse<AddonInterface[]>) => {
        if (response.status && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener los addons');
      }),
    );
  }

  /** Sesión Stripe Checkout para suscribirse a un plan (`gateway`: stripe | nowpayments). */
  createSubscriptionCheckout(
    planId: string,
    gateway: 'stripe' | 'nowpayments' = 'stripe',
    context: 'settings' | 'onboarding' = 'settings',
  ): Observable<{ id: string; url: string | null }> {
    return this.http
      .post<ApiResponse<{ id: string; url: string | null }>>(`${this.apiUrl}/plans/checkout`, {
        planId,
        gateway,
        context,
      })
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message ?? 'No se pudo iniciar la facturación');
        }),
      );
  }

  createAddonCheckout(
    addonId: string,
    gateway: 'stripe' | 'nowpayments' = 'stripe',
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    context: 'settings' | 'onboarding' = 'settings',
  ): Observable<{ id: string; url: string | null }> {
    return this.http
      .post<ApiResponse<{ id: string; url: string | null }>>(`${this.apiUrl}/addons/checkout`, {
        addonId,
        gateway,
        billingCycle,
        context,
      })
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message ?? 'No se pudo iniciar la facturación del addon');
        }),
      );
  }

  getSubscriptionSummary(): Observable<SubscriptionSummary> {
    return this.http
      .get<ApiResponse<SubscriptionSummary>>(`${this.apiUrl}/billing/subscription/summary`)
      .pipe(
        map((response: ApiResponse<SubscriptionSummary>) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener el resumen de suscripción');
        }),
      );
  }

  createCustomerPortal(): Observable<{ url: string }> {
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.apiUrl}/billing/customer-portal`, {})
      .pipe(
        map((response) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'No se pudo abrir el portal de facturación');
        }),
      );
  }

  /** Solicitud de addon deshabilitada hasta integrar pasarela. */
  requestAddon(
    companyId: string,
    addonId: string,
    comments?: string,
  ): Observable<AddonPurchaseRequest> {
    console.log('requestAddon', companyId, addonId, comments);
    return throwError(
      () =>
        new Error('Addons deshabilitados temporalmente. Próximamente integración con pasarela.'),
    );
  }
}
