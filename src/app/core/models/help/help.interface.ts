import { PaginatedResponse } from '../../../shared/interfaces/response.interface';

export type ReleaseNoteItemKind = 'novedad' | 'mejora' | 'correccion';
export type ReleaseNoteStatus = 'draft' | 'published';

export interface ReleaseNoteItemInterface {
  kind: ReleaseNoteItemKind;
  text: string;
  route?: string | null;
}

export interface ReleaseNoteInterface {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  status: ReleaseNoteStatus;
  items: ReleaseNoteItemInterface[];
}

export interface HelpProgressInterface {
  hasUnseen: boolean;
  latest: ReleaseNoteInterface | null;
  lastSeenReleaseNoteId: string | null;
  dismissedTourKeys: string[];
  completedTourKeys: string[];
  shouldAutoOpenWhatsNew: boolean;
  autoOpenWhatsNew: boolean;
  autoStartScreenGuides: boolean;
  guidedHelpPaused: boolean;
}

export interface DismissedToursInterface {
  dismissedTourKeys: string[];
}

export interface CompletedToursInterface {
  completedTourKeys: string[];
}

export interface HelpPreferencesInterface {
  autoOpenWhatsNew: boolean;
  autoStartScreenGuides: boolean;
  guidedHelpPaused: boolean;
}

export type HelpPreferencesUpdate = Partial<HelpPreferencesInterface>;

export type ReleaseNotesResponseInterface = PaginatedResponse<ReleaseNoteInterface>;
