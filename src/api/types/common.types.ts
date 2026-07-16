export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  meta?: any;
  success?: boolean;
}
