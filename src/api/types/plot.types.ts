// src/pages/PlotEditor/types/index.ts

export type ObjectType = "static" | "bed";
export type Subtype = "building" | "tree" | "path" | "water";
export type Tool =
  | "view"
  | "select"
  | "addStatic"
  | "addBed"
  | "delete"
  | "plant";

export interface BaseObject {
  id: string;
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface StaticObject extends BaseObject {
  type: "static";
  name: string;
  color: string;
  subtype: Subtype;
}

export interface Planting {
  id: string;
  cropId: string;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: { row: number; col: number }[];
  color: string;
}

export interface Bed extends BaseObject {
  type: "bed";
  name: string;
  color: string;
  plantings: Planting[];
  createdAt: string;
}

export type GardenObject = StaticObject | Bed;

export interface Crop {
  id: string;
  name: string;
  vegetationDays: number;
  color: string;
}

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
