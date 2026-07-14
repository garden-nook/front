// src/api/endpoints/crops.ts
import { api } from "../client";
import {
  type Crop,
  type CropFamily,
  type CropRule,
  type CreateCropRequest,
  type UpdateCropRequest,
  type CreateFamilyRequest,
  type UpdateFamilyRequest,
  type CreateRuleRequest,
} from "../types/crops.types";

export const cropsApi = {
  // ===== СЕМЕЙСТВА =====
  getFamilies: () => api.get<CropFamily[]>("/crop-families"),

  getFamilyById: (id: string) => api.get<CropFamily>(`/crop-families/${id}`),

  // ===== КУЛЬТУРЫ =====
  getCrops: (params?: {
    page?: number;
    limit?: number;
    familyId?: string;
    search?: string;
  }) => api.get<Crop[]>("/crops", { params }),

  getCropById: (id: string) => api.get<Crop>(`/crops/${id}`),

  // ===== АДМИН-МЕТОДЫ (для семейств) =====
  createFamily: (data: CreateFamilyRequest) =>
    api.post<CropFamily>("/admin/crop-families", data),

  updateFamily: (id: string, data: UpdateFamilyRequest) =>
    api.put<CropFamily>(`/admin/crop-families/${id}`, data),

  deleteFamily: (id: string) => api.delete(`/admin/crop-families/${id}`),

  // ===== АДМИН-МЕТОДЫ (для культур) =====
  createCrop: (data: CreateCropRequest) => api.post<Crop>("/admin/crops", data),

  updateCrop: (id: string, data: UpdateCropRequest) =>
    api.put<Crop>(`/admin/crops/${id}`, data),

  deleteCrop: (id: string) => api.delete(`/admin/crops/${id}`),

  // ===== АДМИН-МЕТОДЫ (для правил) =====
  getRules: () => api.get<CropRule[]>("/admin/crop-rules"),

  createRule: (data: CreateRuleRequest) =>
    api.post<CropRule>("/admin/crop-rules", data),

  deleteRule: (id: string) => api.delete(`/admin/crop-rules/${id}`),
};
