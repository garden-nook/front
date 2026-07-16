import { type ApiResponse } from "./common.types";

/** Запрос на вход (internal_modules_auth.LoginRequest) */
export interface LoginRequest {
  email: string;
  password: string; // 8-18
}

/** Запрос на регистрацию (internal_modules_auth.RegisterRequest) */
export interface RegisterRequest {
  display_name: string; // 2-100
  email: string;
  password: string; // 8-18
}

/** Ответ с токеном (internal_modules_auth.TokenResponse) */
export interface TokenResponse {
  access_token: string;
  expires_in: number; // Время жизни в секундах
  token_type: "user" | "admin"; // Обычно "Bearer"
}

/** Модель пользователя (internal_modules_auth.User) */
export interface User {
  created_at: string;
  display_name: string;
  email: string;
  user_id: string;
}

/** Ответ с профилем (internal_modules_auth.MeResponse) */
export interface MeResponse {
  display_name: string;
  email: string;
  id: string;
  type: "user" | "admin";
}

// Типизированные ответы для API-функций
export type LoginResponse = ApiResponse<TokenResponse>;
export type RegisterResponse = ApiResponse<User>;
export type MeResponseFull = ApiResponse<MeResponse>;
export type ErrorResponse = ApiResponse<string>;
