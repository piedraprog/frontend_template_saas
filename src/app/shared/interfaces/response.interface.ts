export interface ApiResponse<T> {
  status: boolean; // Indica si la operación fue exitosa
  statusCode: number; // Código de estado HTTP
  message?: string; // Mensaje opcional de éxito o error
  data?: T; // Los datos devueltos por la API, pueden ser de cualquier tipo
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type MaybeApiResponse<T> = T | ApiResponse<T>;

export function unwrapApiResponse<T>(response: MaybeApiResponse<T>, fallbackMessage: string): T {
  if (
    response &&
    typeof response === 'object' &&
    'status' in response &&
    'statusCode' in response
  ) {
    if (response.status && response.data !== undefined) {
      return response.data;
    }

    throw new Error(response.message || fallbackMessage);
  }

  return response as T;
}
