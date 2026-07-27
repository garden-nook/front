// src/api/endpoints/crops.ts
import { api } from "../client"; // ← Исправлено: api вместо client
import type {
  CreateCropRequest,
  CreateFamilyRequest,
  Crop,
  CropExtended,
  CropFamily,
  UpdateCropRequest,
  UpdateFamilyRequest,
} from "../types/crops.types";

// ============================================================
// КУЛЬТУРЫ
// ============================================================

const BASE_URL = "/api/v1/crops";

export async function getCrops(params?: { family_id?: number; search?: string }): Promise<Crop[]> {
  const response = await api.get<{ data: Crop[] }>(BASE_URL, { params });
  return response.data.data;
}

export async function getCropById(id: number): Promise<CropExtended | null> {
  const response = await api.get<{ data: CropExtended }>(`${BASE_URL}/${id}`);
  return response.data.data;
}

export async function createCrop(data: CreateCropRequest): Promise<number> {
  const response = await api.post<{ data: { id: number } }>(BASE_URL, data);
  return response.data.data.id;
}

export async function updateCrop(id: number, data: UpdateCropRequest): Promise<number> {
  const response = await api.put<{ data: { id: number } }>(`${BASE_URL}/${id}`, data);
  return response.data.data.id;
}

export async function deleteCrop(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}

// ============================================================
// СЕМЕЙСТВА
// ============================================================

const FAMILIES_URL = "/api/v1/crop-families";

export async function getCropFamilies(): Promise<CropFamily[]> {
  const response = await api.get<{ data: CropFamily[] }>(FAMILIES_URL);
  return response.data.data;
}

export async function getCropFamily(id: number): Promise<CropFamily> {
  const response = await api.get<{ data: CropFamily }>(`${FAMILIES_URL}/${id}`);
  return response.data.data;
}

export async function createCropFamily(data: CreateFamilyRequest): Promise<number> {
  const response = await api.post<{ data: { id: number } }>(FAMILIES_URL, data);
  return response.data.data.id;
}

export async function updateCropFamily(id: number, data: UpdateFamilyRequest): Promise<number> {
  const response = await api.put<{ data: { id: number } }>(`${FAMILIES_URL}/${id}`, data);
  return response.data.data.id;
}

export async function deleteCropFamily(id: number): Promise<void> {
  await api.delete(`${FAMILIES_URL}/${id}`);
}
