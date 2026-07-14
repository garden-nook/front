// src/api/endpoints/auth.ts
import { api } from "../client";
import {
  type LoginRequest,
  type RegisterRequest,
  type TokenResponse,
  type User,
} from "../types/auth.types";

export const authApi = {
  login: (data: LoginRequest) => api.post<TokenResponse>("/auth/login", data),

  register: (data: RegisterRequest) => api.post<User>("/auth/register", data),

  getMe: () => api.get<User>("/auth/me"),
};
