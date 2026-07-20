import { type ApiResponse } from "./common.types";

// ============================================================
// ТИПЫ КОНТЕКСТА И СОЛНЦА
// ============================================================

/** Тип контекста (internal_modules_crops.ContextType) */
export type ContextType = 1 | 2 | 3;

/** Потребности в солнце (internal_modules_crops.SunNeeds) */
export const SUN_NEEDS = {
  FULL_SUN: 1,       // Солнце
  PARTIAL_SHADE: 2,  // Полутень
  FULL_SHADE: 3,     // Тень
} as const;

export type SunNeeds = (typeof SUN_NEEDS)[keyof typeof SUN_NEEDS]; // 1 | 2 | 3

// ============================================================
// ТИПЫ ПОЧВЫ (НОВОЕ В v0.0.5)
// ============================================================

/** Тип почвы (internal_modules_crops.SoilType) */
export interface SoilType {
  id: number;
  name: string;
  description?: string;
}

// ============================================================
// СЕМЕЙСТВА КУЛЬТУР
// ============================================================

/** Семейство культур (internal_modules_crops.CropFamily) */
export interface CropFamily {
  id: number;
  name: string;
  description?: string;
}

// ============================================================
// КУЛЬТУРЫ (ОБНОВЛЁННЫЕ ПОД v0.0.5)
// ============================================================

/** Культура (internal_modules_crops.Crop) — обновлённая */
export interface Crop {
  id: number;
  name: string;
  description?: string;
  family_id: number;           // ← НОВОЕ: ID семейства
  family_name: string;          // ← НОВОЕ: название семейства
  soil_type_id: number;        // ← НОВОЕ: ID типа почвы
  soil_name: string;           // ← НОВОЕ: название типа почвы
  sun_needs: SunNeeds;         // ← переименовано с sunNeeds
  vegetation_days_avg: number; // ← переименовано с vegetationDaysAvg
}

// ============================================================
// ОТНОШЕНИЯ КУЛЬТУР (НОВОЕ В v0.0.5)
// ============================================================

/** Связь с культурой (CropRelation) */
export interface CropRelation {
  crop_id: number;
  crop_name: string;
}

/** Связь с семейством (FamilyRelation) */
export interface FamilyRelation {
  family_id: number;
  family_name: string;
}

/** Все отношения культуры (CropRelations) */
export interface CropRelations {
  good_predecessors: CropRelation[];          // Хорошие предшественники
  bad_predecessors: CropRelation[];           // Плохие предшественники
  good_predecessor_families: FamilyRelation[];
  bad_predecessor_families: FamilyRelation[];
  good_companions: CropRelation[];            // Хорошие соседи
  bad_companions: CropRelation[];             // Плохие соседи
  good_companion_families: FamilyRelation[];
  bad_companion_families: FamilyRelation[];
  good_successors: CropRelation[];            // Хорошие последователи
  bad_successors: CropRelation[];             // Плохие последователи
  good_successor_families: FamilyRelation[];
  bad_successor_families: FamilyRelation[];
}

/** Расширенная культура с отношениями (CropExtended) */
export interface CropExtended {
  crop: Crop;
  crop_relations: CropRelations;
}

// ============================================================
// ПРАВИЛА СОВМЕСТИМОСТИ
// ============================================================

/** Правило совместимости (internal_modules_crops.CropRule) */
export interface CropRule {
  id: number;
  context_crop_id?: number;
  context_family_id?: number;
  context_type: ContextType;
  subject_crop_id?: number;
  subject_family_id?: number;
  score_modifier: number;
  return_after_days: number;
  priority: number;
  explanation: string;
}

// ============================================================
// ЗАПРОСЫ (CREATE / UPDATE)
// ============================================================

/** Создание семейства (internal_modules_crops.CreateFamilyRequest) */
export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

/** Обновление семейства (internal_modules_crops.UpdateFamilyRequest) */
export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
}

/** Создание культуры (internal_modules_crops.CreateCropRequest) */
export interface CreateCropRequest {
  family_id: number;           // ← обязательно
  name: string;
  soil_type_id: number;        // ← обязательно (НОВОЕ)
  sun_needs: SunNeeds;         // ← обязательно
  vegetation_days_avg: number; // ← обязательно
}

/** Обновление культуры (internal_modules_crops.UpdateCropRequest) */
export interface UpdateCropRequest {
  family_id?: number;
  name?: string;
  soil_type_id?: number;       // ← НОВОЕ
  sun_needs?: SunNeeds;
  vegetation_days_avg?: number;
}

/** Создание типа почвы (internal_modules_crops.CreateSoilTypeRequest) */
export interface CreateSoilTypeRequest {
  name: string;
  description?: string;
}

/** Обновление типа почвы (internal_modules_crops.UpdateSoilTypeRequest) */
export interface UpdateSoilTypeRequest {
  name?: string;
  description?: string;
}

// ============================================================
// ОТВЕТЫ API
// ============================================================

export type CropsListResponse = ApiResponse<Crop[]>;
export type CropResponse = ApiResponse<Crop>;
export type CropExtendedResponse = ApiResponse<CropExtended>;
export type FamiliesListResponse = ApiResponse<CropFamily[]>;
export type FamilyResponse = ApiResponse<CropFamily>;
export type RulesListResponse = ApiResponse<CropRule[]>;
export type RuleResponse = ApiResponse<CropRule>;
export type SoilTypesListResponse = ApiResponse<SoilType[]>;
export type SoilTypeResponse = ApiResponse<SoilType>;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ МАППИНГА
// ============================================================

/** Преобразовать SunNeeds в читаемый текст */
export function mapSunNeeds(value: SunNeeds): string {
  switch (value) {
    case SUN_NEEDS.FULL_SUN: return 'Солнце';
    case SUN_NEEDS.PARTIAL_SHADE: return 'Полутень';
    case SUN_NEEDS.FULL_SHADE: return 'Тень';
    default: return 'Не указано';
  }
}

/** Получить все возможные значения SunNeeds для выпадающего списка */
export const SUN_NEEDS_OPTIONS = [
  { value: SUN_NEEDS.FULL_SUN, label: 'Солнце' },
  { value: SUN_NEEDS.PARTIAL_SHADE, label: 'Полутень' },
  { value: SUN_NEEDS.FULL_SHADE, label: 'Тень' },
];