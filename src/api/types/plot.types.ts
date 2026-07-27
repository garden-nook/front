import type { Plot } from "./plots.types";

export interface Bed {
  bed_id: string;
  name: string;
  x_start: number;
  y_start: number;
  width: number;
  height: number;
  plant_date?: string;
  current_crop_id?: number;
}

export interface Object {
  object_id: string;
  name: string;
  object_type: number;
  x_start: number;
  y_start: number;
  width: number;
  height: number;
}

export interface PlotStructure {
  plot: Plot;
  beds: Bed[];
  objects: Object[];
  shade_groups?: ShadeGroup[];
}

// ===== ТИПЫ СОБЫТИЙ =====

export const EventType = {
  PlotResized: 10,
  BedCreated: 11,
  BedUpdated: 12,
  BedDeleted: 13,
  ObjectCreated: 14,
  ObjectUpdated: 15,
  ObjectDeleted: 16,
  CropPlanted: 17,
  CropRemoved: 18,
  CellShadeUpdated: 19,
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// PlotResized (10)
export interface PlotResizedPayload {
  new_width_meters: number;
  new_height_meters: number;
}

// BedCreated (11)
export interface BedCreatedPayload {
  name: string;
  x_start: number;
  y_start: number;
  width: number;
  height: number;
}

// BedUpdated (12)
export interface BedUpdatedPayload {
  bed_id: string;
  name?: string;
  x_start?: number;
  y_start?: number;
  width?: number;
  height?: number;
}

// BedDeleted (13)
export interface BedDeletedPayload {
  bed_id: string;
}

// ObjectCreated (14)
export interface ObjectCreatedPayload {
  name: string;
  object_type: number;
  x_start: number;
  y_start: number;
  width: number;
  height: number;
}

// ObjectUpdated (15)
export interface ObjectUpdatedPayload {
  object_id: string;
  name?: string;
  object_type?: number;
  x_start?: number;
  y_start?: number;
  width?: number;
  height?: number;
}

// ObjectDeleted (16)
export interface ObjectDeletedPayload {
  object_id: string;
}

// CropPlanted (17)
export interface CropPlantedPayload {
  bed_id: string;
  crop_id: number;
  plant_date?: string;
}

// CropRemoved (18)
export interface CropRemovedPayload {
  bed_id: string;
  harvested: boolean;
  date?: string;
}

// CellShadeUpdated (19)
export interface CellShadeUpdatedPayload {
  shade_groups: ShadeGroup[];
}

export interface ShadeGroup {
  shade_level: ShadeLevel;
  cells: CellCoord[];
}

export interface CellCoord {
  x: number;
  y: number;
}

// ShadeLevel (добавляем, если его нет)
export const ShadeLevel = {
  Full: 1,
  Partial: 2,
  Shade: 3,
} as const;

export type ShadeLevel = (typeof ShadeLevel)[keyof typeof ShadeLevel];

// Общий тип для события
export interface PlotEvent {
  type: EventType;
  payload:
    | PlotResizedPayload
    | BedCreatedPayload
    | BedUpdatedPayload
    | BedDeletedPayload
    | ObjectCreatedPayload
    | ObjectUpdatedPayload
    | ObjectDeletedPayload
    | CropPlantedPayload
    | CropRemovedPayload
    | CellShadeUpdatedPayload;
}

export interface PlotEvents {
  events: PlotEvent[];
}

// ===== UI ТИПЫ ДЛЯ РЕДАКТОРА =====

export type Tool = "view" | "select" | "addStatic" | "addBed" | "delete" | "plant";

export type Subtype = "building" | "tree" | "path" | "water";
export type ObjectType = "static" | "bed";

export interface BaseUIObject {
  id: string;
  name: string;
  color: string;
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface UIBed extends BaseUIObject {
  type: "bed";
  plantings: UIPlanting[];
  createdAt: string;
  currentCropId?: number | null;
  currentCropName?: string | null;
  plantDate?: string | null;
}

export interface UIStaticObject extends BaseUIObject {
  type: "static";
  subtype: Subtype;
}

export interface UIPlanting {
  id: string;
  cropId: number;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: { row: number; col: number }[];
  color: string;
}

export interface UICrop {
  id: number;
  name: string;
  vegetationDays: number;
  color: string;
}

export type GardenObject = UIBed | UIStaticObject;

export interface Rect {
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface GridRect {
  start: GridPosition;
  end: GridPosition;
}

// Конфигурация статических объектов
export const STATIC_COLORS: Record<Subtype, string> = {
  building: "#8B7355",
  tree: "#2E7D32",
  path: "#D2B48C",
  water: "#4A90D9",
};

export const STATIC_LABELS: Record<Subtype, string> = {
  building: "Дом",
  tree: "Дерево",
  path: "Дорожка",
  water: "Вода",
};

export const STATIC_ICONS: Record<Subtype, string> = {
  building: "🏠",
  tree: "🌳",
  path: "🛤️",
  water: "💧",
};

export interface BedCropHistoryEntry {
  crop_id: number;
  crop_name: string;
  family_name: string;
  plant_date: string;
  harvest_date?: string;
}
