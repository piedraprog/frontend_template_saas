export interface ApiResponse<T> {
  status: boolean; // Indica si la operación fue exitosa
  statusCode: number; // Código de estado HTTP
  message?: string; // Mensaje opcional de éxito o error
  data?: T; // Los datos devueltos por la API, pueden ser de cualquier tipo
}
