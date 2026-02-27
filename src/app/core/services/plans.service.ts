import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, throwError } from 'rxjs';
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

  getCurrentSubscription(companyId: string): Observable<SubscriptionInterface> {
    return this.http
      .get<ApiResponse<SubscriptionInterface>>(`${this.apiUrl}/companies/${companyId}/subscription`)
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
    return of([]);
    // return this.http.get<ApiResponse<AddonInterface[]>>(`${this.apiUrl}/addons`).pipe(...)
  }

  getSubscriptionSummary(companyId: string): Observable<SubscriptionSummary> {
    return this.http
      .get<
        ApiResponse<SubscriptionSummary>
      >(`${this.apiUrl}/companies/${companyId}/subscription/summary`)
      .pipe(
        map((response: ApiResponse<SubscriptionSummary>) => {
          if (response.status && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener el resumen de suscripción');
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
