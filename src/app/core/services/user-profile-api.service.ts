import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/response.interface';

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  avatar?: string;
}

export interface ProfileUpdateResult {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  updateProfile(body: UpdateProfilePayload): Observable<ProfileUpdateResult> {
    return this.http
      .put<ApiResponse<ProfileUpdateResult>>(`${this.baseUrl}/users/profile/me`, body)
      .pipe(
        map((res) => {
          if (res.status && res.data) {
            return res.data;
          }
          throw new Error(res.message ?? 'No se pudo actualizar el perfil');
        }),
      );
  }

  uploadAvatar(file: File): Observable<ProfileUpdateResult> {
    const formData = new FormData();
    formData.append('avatar', file, file.name);
    return this.http
      .post<ApiResponse<ProfileUpdateResult>>(`${this.baseUrl}/users/profile/avatar`, formData)
      .pipe(
        map((res) => {
          if (res.status && res.data) {
            return res.data;
          }
          throw new Error(res.message ?? 'No se pudo subir la imagen');
        }),
      );
  }
}
