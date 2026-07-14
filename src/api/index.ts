// src/api/index.ts
export { api, apiClient } from "./client";
export { authApi } from "./endpoints/auth";
export { cropsApi } from "./endpoints/crops";

// Экспорт всех типов для удобства
export type * from "./types/auth.types";
export type * from "./types/crops.types";
export type * from "./types/common.types";
