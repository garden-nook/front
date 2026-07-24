import { useState, useCallback } from "react";
import type {
  Bed,
  Crop,
  GardenObject,
  Planting,
  Rect,
  StaticObject,
  Subtype,
} from "../api/types/plot.types";

export const CROPS: Crop[] = [
  { id: "crop-1", name: "Томаты", vegetationDays: 90, color: "#EF4444" },
  { id: "crop-2", name: "Огурцы", vegetationDays: 60, color: "#22C55E" },
  { id: "crop-3", name: "Морковь", vegetationDays: 80, color: "#F59E0B" },
  { id: "crop-4", name: "Перец", vegetationDays: 100, color: "#EAB308" },
  { id: "crop-5", name: "Лук", vegetationDays: 70, color: "#A855F7" },
  { id: "crop-6", name: "Кабачки", vegetationDays: 55, color: "#10B981" },
  { id: "crop-7", name: "Свекла", vegetationDays: 75, color: "#EC4899" },
  { id: "crop-8", name: "Картофель", vegetationDays: 85, color: "#8B5CF6" },
];

export const STATIC_COLORS: Record<Subtype, string> = {
  building: "#8B7355",
  tree: "#2E7D32",
  path: "#D2B48C",
  water: "#4A90D9",
};

export const STATIC_LABELS: Record<Subtype, string> = {
  building: "🏠 Дом",
  tree: "🌳 Дерево",
  path: "🛤️ Дорожка",
  water: "💧 Вода",
};

export const STATIC_ICONS: Record<Subtype, string> = {
  building: "🏠",
  tree: "🌳",
  path: "🛤️",
  water: "💧",
};

const rectsOverlap = (a: Rect, b: Rect): boolean => {
  return !(
    a.col + a.width <= b.col ||
    b.col + b.width <= a.col ||
    a.row + a.height <= b.row ||
    b.row + b.height <= a.row
  );
};

const isWithinPlot = (rect: Rect, rows: number, cols: number): boolean => {
  return (
    rect.row >= 0 &&
    rect.col >= 0 &&
    rect.row + rect.height <= rows &&
    rect.col + rect.width <= cols
  );
};

export const usePlotEditor = () => {
  const [objects, setObjects] = useState<GardenObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<GardenObject | null>(
    null,
  );
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const findOverlaps = useCallback(
    (rect: Rect, excludeId?: string): GardenObject[] => {
      return objects.filter(
        (obj) => obj.id !== excludeId && rectsOverlap(rect, obj),
      );
    },
    [objects],
  );

  const addObject = useCallback((obj: GardenObject) => {
    setObjects((prev) => [...prev, obj]);
  }, []);

  const updateObject = useCallback(
    (id: string, updates: Partial<GardenObject>) => {
      setObjects((prev) =>
        prev.map((obj): GardenObject => {
          if (obj.id === id) {
            return { ...obj, ...updates } as GardenObject;
          }
          return obj;
        }),
      );
    },
    [],
  );

  const deleteObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
    setSelectedObject(null);
    setSelectedBed(null);
  }, []);

  const addPlanting = useCallback(
    (bedId: string, planting: Omit<Planting, "id">) => {
      const newPlanting: Planting = { ...planting, id: `plant-${Date.now()}` };
      setObjects((prev) =>
        prev.map((obj): GardenObject => {
          if (obj.type === "bed" && obj.id === bedId) {
            const bed = obj as Bed;
            return {
              ...bed,
              plantings: [...bed.plantings, newPlanting],
            } as Bed;
          }
          return obj;
        }),
      );
    },
    [],
  );

  const harvestPlanting = useCallback((bedId: string, plantingId: string) => {
    setObjects((prev) =>
      prev.map((obj): GardenObject => {
        if (obj.type === "bed" && obj.id === bedId) {
          const bed = obj as Bed;
          return {
            ...bed,
            plantings: bed.plantings.map((p) =>
              p.id === plantingId
                ? { ...p, harvestDate: new Date().toISOString().split("T")[0] }
                : p,
            ),
          } as Bed;
        }
        return obj;
      }),
    );
  }, []);

  const createBed = useCallback(
    (rect: Rect, name: string): Bed => {
      const cells = [];
      for (let r = rect.row; r < rect.row + rect.height; r++) {
        for (let c = rect.col; c < rect.col + rect.width; c++) {
          cells.push({ row: r, col: c });
        }
      }

      return {
        id: `bed-${Date.now()}`,
        type: "bed",
        name:
          name ||
          `Грядка ${objects.filter((o) => o.type === "bed").length + 1}`,
        color: "#22c55e",
        ...rect,
        plantings: [],
        createdAt: new Date().toISOString(),
      };
    },
    [objects],
  );

  const createStaticObject = useCallback(
    (rect: Rect, subtype: Subtype): StaticObject => {
      return {
        id: `static-${Date.now()}`,
        type: "static",
        subtype,
        name: STATIC_LABELS[subtype].replace(/[🏠🌳🛤️💧]\s*/, ""),
        color: STATIC_COLORS[subtype],
        ...rect,
      };
    },
    [],
  );

  return {
    objects,
    setObjects,
    selectedObject,
    setSelectedObject,
    selectedBed,
    setSelectedBed,
    findOverlaps,
    addObject,
    updateObject,
    deleteObject,
    addPlanting,
    harvestPlanting,
    createBed,
    createStaticObject,
    CROPS,
  };
};
