export const MAX_TRACK_DURATION_MILLISECONDS = 100 * 60 * 60 * 1000;

export interface TrackRecord {
  trackId: number;
  name: string;
  albumId: number | null;
  albumTitle: string | null;
  artistName: string | null;
  genreId: number | null;
  genreName: string | null;
  mediaTypeId: number;
  mediaTypeName: string | null;
  composer: string | null;
  milliseconds: number;
  bytes: number | null;
  unitPrice: number;
}

export interface TrackCreateRequest {
  name: string;
  albumId: number;
  genreId: number;
  mediaTypeId: number;
  composer: string | null;
  milliseconds: number;
  unitPrice: number;
}

// Generic paged model for list responses.
export interface PagedModel<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ProblemDetail {
  detail: string;
  fieldErrors?: Record<string, string>;
}

export interface EmployeeRecord {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginSessionResponse {
  email: string | null;
}

// Stored in the session after login; GET /api/login/session returns all nulls when there is no session.
export interface CurrentUser {
  employeeId: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface AlbumRecord {
  albumId: number;
  title: string;
  artistId: number;
  artistName: string | null;
  tracks: TrackRecord[];
}

export interface AlbumCreateRequest {
  artistName: string;
  artistId: number | null;
  title: string;
}

export interface GenreRecord {
  genreId: number;
  name: string | null;
}

export interface MediaTypeRecord {
  mediaTypeId: number;
  name: string | null;
}

// Lookup item used by dropdowns.
export interface KeyResponse {
  key: number;
  value: string | null;
}
