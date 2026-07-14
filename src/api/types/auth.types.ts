import { type ApiResponse } from "./common.types";

/** Запрос на вход (internal_modules_auth.LoginRequest) */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Запрос на регистрацию (internal_modules_auth.RegisterRequest) */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Возможно, есть другие поля, уточните по Swagger
}

/** Ответ с токеном (internal_modules_auth.TokenResponse) */
export interface TokenResponse {
  access_token: string;
  token_type: string; // Обычно "Bearer"
  expires_in: number; // Время жизни в секундах
}

/** Модель пользователя (internal_modules_auth.User) */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string; // Может быть опциональным
  role?: string; // Возможно, "user" или "admin"
}

/** Ответ с профилем (internal_modules_auth.MeResponse) */
export interface MeResponse extends User {}

// Типизированные ответы для API-функций
export type LoginResponse = ApiResponse<TokenResponse>;
export type RegisterResponse = ApiResponse<TokenResponse> | ApiResponse<User>;
export type MeResponseFull = ApiResponse<MeResponse>;
