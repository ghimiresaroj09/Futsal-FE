/**
 * Generic response shapes. Adjust these to match your backend's envelope
 * (e.g. Laravel's `data`/`meta`, NestJS interceptors, Django paginators…)
 * so the rest of the app can stay loosely typed against them.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
