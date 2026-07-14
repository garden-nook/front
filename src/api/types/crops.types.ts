import { type ApiResponse } from "./common.types";

/** Тип контекста (internal_modules_crops.ContextType) */
export type ContextType = 1 | 2 | 3;

/** Потребности в солнце (internal_modules_crops.SunNeeds) */
export const SUN_NEEDS = {
  FULL_SUN: 1,
  PARTIAL_SHADE: 2,
  FULL_SHADE: 3,
} as const;

export type SunNeeds = (typeof SUN_NEEDS)[keyof typeof SUN_NEEDS]; // 1 | 2 | 3

/** Семейство культур (internal_modules_crops.CropFamily) */
export interface CropFamily {
  id: string;
  name: string;
  description?: string;
  // Возможно, другие поля
}

/** Культура (internal_modules_crops.Crop) */
export interface Crop {
  id: string;
  name: string;
  familyId: string;
  family?: CropFamily; // Придет, если запрошено с расширением
  sunNeeds: SunNeeds;
  plantingMonths?: string[]; // Массив месяцев
  harvestMonths?: string[];
  imageUrl?: string;
  description?: string;
  // Дополнительные поля, если есть
}

/** Правило совместимости (internal_modules_crops.CropRule) */
export interface CropRule {
  id: string;
  cropId: string;
  companionCropId: string;
  type: "good" | "bad"; // Хороший или плохой сосед
  crop?: Crop; // Придет с расшифровкой
  companionCrop?: Crop;
}

// ===== ЗАПРОСЫ (Create/Update) =====

/** Создание семейства (internal_modules_crops.CreateFamilyRequest) */
export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

/** Обновление семейства (internal_modules_crops.UpdateFamilyRequest) */
export interface UpdateFamilyRequest extends Partial<CreateFamilyRequest> {}

/** Создание культуры (internal_modules_crops.CreateCropRequest) */
export interface CreateCropRequest {
  name: string;
  familyId: string;
  sunNeeds: SunNeeds;
  plantingMonths?: string[];
  harvestMonths?: string[];
  imageUrl?: string;
  description?: string;
}

/** Обновление культуры (internal_modules_crops.UpdateCropRequest) */
export interface UpdateCropRequest extends Partial<CreateCropRequest> {
  id?: string; // ID передается в URL
}

/** Создание правила (internal_modules_crops.CreateRuleRequest) */
export interface CreateRuleRequest {
  cropId: string;
  companionCropId: string;
  type: "good" | "bad";
}

// Типизированные ответы для API-функций
export type CropsListResponse = ApiResponse<Crop[]>;
export type CropResponse = ApiResponse<Crop>;
export type FamiliesListResponse = ApiResponse<CropFamily[]>;
export type FamilyResponse = ApiResponse<CropFamily>;
export type RulesListResponse = ApiResponse<CropRule[]>;
export type RuleResponse = ApiResponse<CropRule>;
