// src/types/plot.types.ts
export interface GridPosition {
  row: number;
  col: number;
}

export interface GridRect {
  start: GridPosition;
  end: GridPosition;
}

export interface StaticObject {
  id: string;
  name: string;
  rect: GridRect;
  color: string;
  type: "building" | "tree" | "path" | "water";
}

export interface PlantingHistory {
  id: string;
  cropId: string;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: GridPosition[];
  color: string;
}

export interface Bed {
  id: string;
  name: string;
  cells: GridPosition[];
  plantings: PlantingHistory[];
  createdAt: string;
}

export interface PlotEditorState {
  plotSize: GridRect;
  gridSize: 0.5;
  staticObjects: StaticObject[];
  beds: Bed[];
  selectedBedId: string | null;
}
