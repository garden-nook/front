// src/utils/plotStorage.ts

import { testPlotData } from "../components/plot/testPlotData";

const STORAGE_KEY = "plot_data";

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

export const loadPlotData = (): PlotEditorState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);

      if (data && data.plotSize && data.plotSize.start && data.plotSize.end) {
        console.log("✅ Данные загружены из localStorage:", data);
        return data;
      } else {
        console.warn(
          "⚠️ Данные в localStorage некорректны, используем тестовые",
        );
      }
    }
  } catch (error) {
    console.error("❌ Ошибка загрузки данных из localStorage:", error);
  }

  console.log("📦 Используем тестовые данные:", testPlotData);
  return testPlotData as PlotEditorState;
};

export const savePlotData = (data: Partial<PlotEditorState>) => {
  try {
    const current = loadPlotData();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log("💾 Данные сохранены в localStorage:", merged);
    return merged;
  } catch (error) {
    console.error("❌ Ошибка сохранения данных:", error);
    return null;
  }
};

export const clearPlotData = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log("🗑️ Данные удалены из localStorage");
};
