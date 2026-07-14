export interface ApiResponse<T = any> {
  data: T; // Сами данные
  message?: string; // Сообщение от сервера
  status?: number; // Код статуса
  errors?: string[]; // Ошибки валидации
}
