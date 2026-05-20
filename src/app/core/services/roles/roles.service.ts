import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/interfaces/response.interface';
import {
  RoleInterface,
  CreateRoleDto,
  UpdateRoleDto,
} from '../../models/interfaces/role.interface';

/** Alias usado en vistas de administración de equipo. */
export type CustomRole = RoleInterface;

export interface RoleFormPayload {
  name: string;
  permissions: number;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/roles`;

  list(): Observable<RoleInterface[]> {
    return this.http.get<RoleInterface[] | ApiResponse<RoleInterface[]>>(this.baseUrl).pipe(
      map((res) => {
        const data = Array.isArray(res) ? res : (res as ApiResponse<RoleInterface[]>).data;
        return Array.isArray(data) ? data : [];
      }),
    );
  }

  /** @deprecated usar `list()` */
  getRoles(): Observable<RoleInterface[]> {
    return this.list();
  }

  getById(id: string): Observable<RoleInterface | null> {
    return this.http
      .get<RoleInterface | ApiResponse<RoleInterface>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(
          (res) =>
            (res && typeof res === 'object' && 'data' in res
              ? (res as ApiResponse<RoleInterface>).data
              : (res as RoleInterface)) ?? null,
        ),
      );
  }

  create(dto: CreateRoleDto): Observable<RoleInterface> {
    return this.http.post<RoleInterface | ApiResponse<RoleInterface>>(this.baseUrl, dto).pipe(
      map((res) => {
        const data =
          res && typeof res === 'object' && 'data' in res
            ? (res as ApiResponse<RoleInterface>).data
            : (res as RoleInterface);
        if (!data) throw new Error('Invalid response from server');
        return data;
      }),
    );
  }

  update(id: string, dto: UpdateRoleDto): Observable<RoleInterface> {
    return this.http
      .patch<RoleInterface | ApiResponse<RoleInterface>>(`${this.baseUrl}/${id}`, dto)
      .pipe(
        map((res) => {
          const data =
            res && typeof res === 'object' && 'data' in res
              ? (res as ApiResponse<RoleInterface>).data
              : (res as RoleInterface);
          if (!data) throw new Error('Invalid response from server');
          return data;
        }),
      );
  }

  delete(id: string): Observable<{ deleted: true }> {
    return this.http
      .delete<{ deleted: true } | ApiResponse<{ deleted: true }>>(`${this.baseUrl}/${id}`)
      .pipe(
        map((res) => {
          const data =
            res && typeof res === 'object' && 'data' in res
              ? (res as ApiResponse<{ deleted: true }>).data
              : (res as { deleted: true });
          if (!data) throw new Error('Invalid response from server');
          return data;
        }),
      );
  }

  createRole(payload: RoleFormPayload): Observable<RoleInterface> {
    return this.create({
      name: payload.name,
      permissions: payload.permissions,
    });
  }

  updateRole(id: string, payload: RoleFormPayload): Observable<RoleInterface> {
    return this.update(id, {
      name: payload.name,
      permissions: payload.permissions,
    });
  }

  deleteRole(id: string): Observable<{ deleted: true }> {
    return this.delete(id);
  }
}
