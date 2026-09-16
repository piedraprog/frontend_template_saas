import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  CompletedToursInterface,
  DismissedToursInterface,
  HelpPreferencesUpdate,
  HelpProgressInterface,
  ReleaseNotesResponseInterface,
} from '../../../models/help/help.interface';
import {
  MaybeApiResponse,
  unwrapApiResponse,
} from '../../../../shared/interfaces/response.interface';

@Injectable({ providedIn: 'root' })
export class HelpApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listReleaseNotes(page = 1, pageSize = 20): Observable<ReleaseNotesResponseInterface> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);

    return this.http
      .get<MaybeApiResponse<ReleaseNotesResponseInterface>>(`${this.baseUrl}/help/release-notes`, {
        params,
      })
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudieron cargar las novedades')));
  }

  getMyProgress(): Observable<HelpProgressInterface> {
    return this.http
      .get<MaybeApiResponse<HelpProgressInterface>>(`${this.baseUrl}/help/me`)
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudo cargar la ayuda')));
  }

  markReleaseSeen(releaseNoteId: string): Observable<HelpProgressInterface> {
    return this.http
      .post<MaybeApiResponse<HelpProgressInterface>>(`${this.baseUrl}/help/me/seen-release`, {
        releaseNoteId,
      })
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudo actualizar la novedad')));
  }

  dismissTour(tourKey: string): Observable<DismissedToursInterface> {
    return this.http
      .post<MaybeApiResponse<DismissedToursInterface>>(`${this.baseUrl}/help/me/dismiss-tour`, {
        tourKey,
      })
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudo guardar el tour')));
  }

  completeTour(tourKey: string): Observable<CompletedToursInterface> {
    return this.http
      .post<MaybeApiResponse<CompletedToursInterface>>(`${this.baseUrl}/help/me/complete-tour`, {
        tourKey,
      })
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudo guardar el tour')));
  }

  updatePreferences(prefs: HelpPreferencesUpdate): Observable<HelpProgressInterface> {
    const body: HelpPreferencesUpdate = {};
    if (prefs.autoOpenWhatsNew !== undefined) {
      body.autoOpenWhatsNew = prefs.autoOpenWhatsNew;
    }
    if (prefs.autoStartScreenGuides !== undefined) {
      body.autoStartScreenGuides = prefs.autoStartScreenGuides;
    }
    if (prefs.guidedHelpPaused !== undefined) {
      body.guidedHelpPaused = prefs.guidedHelpPaused;
    }

    return this.http
      .post<MaybeApiResponse<HelpProgressInterface>>(`${this.baseUrl}/help/me/preferences`, body)
      .pipe(map((response) => unwrapApiResponse(response, 'No se pudo guardar la preferencia')));
  }
}
