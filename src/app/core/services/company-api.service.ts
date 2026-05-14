import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { CompanyInterface } from '../models/interfaces/company.interface';

interface CompanyServiceEnvelope {
  success: boolean;
  message: string;
  data?: CompanyInterface;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getMyCompany(): Observable<CompanyInterface> {
    return this.http.get<ApiResponse<CompanyServiceEnvelope>>(`${this.baseUrl}/companies/me`).pipe(
      map((res) => {
        const envelope = res.data;
        if (res.status && envelope?.success && envelope.data) {
          return envelope.data;
        }
        throw new Error(res.message ?? envelope?.message ?? 'No se pudo cargar la empresa');
      }),
    );
  }

  updateCompany(
    companyId: string,
    body: Pick<CompanyInterface, 'name' | 'logo'>,
  ): Observable<CompanyInterface> {
    return this.http
      .put<ApiResponse<CompanyServiceEnvelope>>(`${this.baseUrl}/companies/${companyId}`, body)
      .pipe(
        map((res) => {
          const envelope = res.data;
          if (res.status && envelope?.success && envelope.data) {
            return envelope.data;
          }
          throw new Error(res.message ?? envelope?.message ?? 'No se pudo actualizar la empresa');
        }),
      );
  }
}
