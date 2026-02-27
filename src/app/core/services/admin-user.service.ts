/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/response.interface';
import { UserInterface } from '../models/interfaces/user.interface';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  #usersSignal = signal<UserInterface[]>([]);
  public users = this.#usersSignal.asReadonly();
  public adminUsers = computed(() => this.#usersSignal());
  public allusers = computed(() => this.users());

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  #paginationSignal = signal<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  public pagination = this.#paginationSignal.asReadonly();

  getUsersByCompanyId(
    companyId: string,
    params?: {
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: number;
      search?: string;
    },
  ): Observable<PaginatedResponse<UserInterface>> {
    const url = `${this.baseUrl}/users/company/${companyId}`;
    this.loadingSignal.set(true);

    return this.http
      .get<ApiResponse<PaginatedResponse<UserInterface>>>(url, { params: params as any })
      .pipe(
        map((response: ApiResponse<PaginatedResponse<UserInterface>>) => {
          if (response.status && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al obtener usuarios');
          }
        }),
        tap((paginatedResponse) => {
          this.#usersSignal.set(paginatedResponse.data);
          this.#paginationSignal.set({
            total: paginatedResponse.total,
            page: paginatedResponse.page,
            limit: paginatedResponse.limit,
            totalPages: paginatedResponse.totalPages,
            hasNext: paginatedResponse.hasNext,
            hasPrev: paginatedResponse.hasPrev,
          });
          this.loadingSignal.set(false);
        }),
      );
  }

  createUser(userData: {
    username: string;
    email: string;
    companyId: string;
    customRoleId?: string;
    password?: string;
  }): Observable<UserInterface> {
    const url = `${this.baseUrl}/users`;
    this.loadingSignal.set(true);

    return this.http.post<ApiResponse<UserInterface>>(url, userData).pipe(
      map((response: ApiResponse<UserInterface>) => {
        if (response.status && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al crear usuario');
        }
      }),
      tap((newUser) => {
        const currentUsers = this.#usersSignal();
        this.#usersSignal.set([...currentUsers, newUser]);
        this.loadingSignal.set(false);
      }),
    );
  }

  updateUser(id: string, userData: Partial<UserInterface>): Observable<UserInterface> {
    const url = `${this.baseUrl}/users/${id}`;
    this.loadingSignal.set(true);

    return this.http.put<ApiResponse<UserInterface>>(url, userData).pipe(
      map((response: ApiResponse<UserInterface>) => {
        if (response.status && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al actualizar usuario');
        }
      }),
      tap((updatedUser) => {
        const currentUsers = this.#usersSignal();
        const updatedUsers = currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        );
        this.#usersSignal.set(updatedUsers);
        this.loadingSignal.set(false);
      }),
    );
  }

  updatePermissions(id: string, permissions: number): Observable<UserInterface> {
    const url = `${this.baseUrl}/users/${id}/permissions`;
    this.loadingSignal.set(true);

    return this.http.put<ApiResponse<UserInterface>>(url, { permissions }).pipe(
      map((response: ApiResponse<UserInterface>) => {
        if (response.status && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al actualizar permisos');
        }
      }),
      tap((updatedUser) => {
        const currentUsers = this.#usersSignal();
        const updatedUsers = currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        );
        this.#usersSignal.set(updatedUsers);
        this.loadingSignal.set(false);
      }),
    );
  }

  deleteUser(id: string): Observable<boolean> {
    const url = `${this.baseUrl}/users/${id}`;
    this.loadingSignal.set(true);

    return this.http.delete<ApiResponse<any>>(url).pipe(
      map((response: ApiResponse<any>) => {
        if (response.status) {
          return true;
        } else {
          throw new Error(response.message || 'Error al eliminar usuario');
        }
      }),
      tap(() => {
        const currentUsers = this.#usersSignal();
        const filteredUsers = currentUsers.filter((user) => user.id !== id);
        this.#usersSignal.set(filteredUsers);
        this.loadingSignal.set(false);
      }),
    );
  }

  toggleUserStatus(id: string, active: boolean): Observable<UserInterface> {
    const url = `${this.baseUrl}/users/${id}`;
    this.loadingSignal.set(true);

    return this.http.put<ApiResponse<UserInterface>>(url, { active }).pipe(
      map((response: ApiResponse<UserInterface>) => {
        if (response.status && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Error al cambiar estado del usuario');
        }
      }),
      tap((updatedUser) => {
        const currentUsers = this.#usersSignal();
        const updatedUsers = currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        );
        this.#usersSignal.set(updatedUsers);
        this.loadingSignal.set(false);
      }),
    );
  }
}
