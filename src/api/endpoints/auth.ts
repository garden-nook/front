// src/api/endpoints/auth.ts
import { api } from "../client";
import {
  type LoginRequest,
  type MeResponse,
  type RegisterRequest,
  type TokenResponse,
  type User,
} from "../types/auth.types";
import type { ApiResponse } from "../types/common.types";

export const authApi = {
  login: (data: LoginRequest) => api.post<ApiResponse<TokenResponse>>("/api/v1/auth/login", data),

  register: (data: RegisterRequest) => api.post<ApiResponse<User>>("/api/v1/auth/register", data),

  getMe: () => api.get<ApiResponse<MeResponse>>("/api/v1/auth/me"),
};
