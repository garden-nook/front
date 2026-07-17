// src/data/testPlotData.ts

// ===== ЛОКАЛЬНЫЕ ТИПЫ (временные, пока нет API) =====

interface GridPosition {
  row: number;
  col: number;
}

interface GridRect {
  start: GridPosition;
  end: GridPosition;
}

interface StaticObject {
  id: string;
  name: string;
  rect: GridRect;
  color: string;
  type: "building" | "tree" | "path" | "water";
}

interface PlantingHistory {
  id: string;
  cropId: string;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: GridPosition[];
  color: string;
}

interface Bed {
  id: string;
  name: string;
  cells: GridPosition[];
  plantings: PlantingHistory[];
  createdAt: string;
}

interface PlotEditorState {
  plotSize: GridRect;
  gridSize: 0.5;
  staticObjects: StaticObject[];
  beds: Bed[];
  selectedBedId: string | null;
}

// ===== СТАТИЧНЫЕ ОБЪЕКТЫ =====
export const testStaticObjects: StaticObject[] = [
  {
    id: "static-1",
    name: "Дом",
    rect: {
      start: { row: 0, col: 0 },
      end: { row: 3, col: 5 }, // ← уменьшили, чтобы не пересекалось с грядками
    },
    color: "#8B7355",
    type: "building",
  },
  {
    id: "static-2",
    name: "Дерево",
    rect: {
      start: { row: 12, col: 0 }, // ← сместили подальше
      end: { row: 14, col: 2 },
    },
    color: "#2E7D32",
    type: "tree",
  },
  {
    id: "static-3",
    name: "Дорожка",
    rect: {
      start: { row: 2, col: 8 }, // ← сместили
      end: { row: 12, col: 8 },
    },
    color: "#D2B48C",
    type: "path",
  },
];

// ===== ГРЯДКИ С ИСТОРИЕЙ =====
export const testBeds: Bed[] = [
  {
    id: "bed-1",
    name: "Грядка 1",
    cells: [
      { row: 5, col: 3 }, // ← сместили вниз, чтобы не пересекаться с домом
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 6, col: 3 },
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
    ],
    plantings: [
      {
        id: "plant-1-1",
        cropId: "crop-1",
        cropName: "Томаты",
        plantedDate: "2024-05-01",
        harvestDate: "2024-08-15",
        cells: [
          { row: 4, col: 3 },
          { row: 4, col: 4 },
          { row: 5, col: 3 },
          { row: 5, col: 4 },
        ],
        color: "#EF4444",
      },
      {
        id: "plant-1-2",
        cropId: "crop-1",
        cropName: "Томаты",
        plantedDate: "2024-05-01",
        harvestDate: "2024-08-15",
        cells: [
          { row: 4, col: 5 },
          { row: 5, col: 5 },
          { row: 6, col: 3 },
          { row: 6, col: 4 },
          { row: 6, col: 5 },
        ],
        color: "#F97316",
      },
      {
        id: "plant-1-3",
        cropId: "crop-3",
        cropName: "Огурцы",
        plantedDate: "2023-06-01",
        harvestDate: "2023-09-01",
        cells: [
          { row: 4, col: 3 },
          { row: 4, col: 4 },
          { row: 4, col: 5 },
        ],
        color: "#22C55E",
      },
      {
        id: "plant-1-4",
        cropId: "crop-4",
        cropName: "Перец",
        plantedDate: "2022-05-15",
        harvestDate: "2022-08-30",
        cells: [
          { row: 5, col: 3 },
          { row: 5, col: 4 },
          { row: 5, col: 5 },
        ],
        color: "#EAB308",
      },
    ],
    createdAt: "2022-03-01",
  },
  {
    id: "bed-2",
    name: "Грядка 2",
    cells: [
      { row: 4, col: 9 },
      { row: 4, col: 10 },
      { row: 4, col: 11 },
      { row: 5, col: 9 },
      { row: 5, col: 10 },
      { row: 5, col: 11 },
    ],
    plantings: [
      {
        id: "plant-2-1",
        cropId: "crop-2",
        cropName: "Морковь",
        plantedDate: "2024-04-15",
        harvestDate: "2024-07-20",
        cells: [
          { row: 4, col: 9 },
          { row: 4, col: 10 },
          { row: 5, col: 9 },
          { row: 5, col: 10 },
        ],
        color: "#F59E0B",
      },
      {
        id: "plant-2-2",
        cropId: "crop-5",
        cropName: "Лук",
        plantedDate: "2023-05-01",
        harvestDate: "2023-08-10",
        cells: [
          { row: 4, col: 11 },
          { row: 5, col: 11 },
        ],
        color: "#A855F7",
      },
    ],
    createdAt: "2022-04-01",
  },
  {
    id: "bed-3",
    name: "Грядка 3",
    cells: [
      { row: 8, col: 3 },
      { row: 8, col: 4 },
      { row: 8, col: 5 },
      { row: 9, col: 3 },
      { row: 9, col: 4 },
      { row: 9, col: 5 },
    ],
    plantings: [
      {
        id: "plant-3-1",
        cropId: "crop-6",
        cropName: "Кабачки",
        plantedDate: "2024-05-15",
        cells: [
          { row: 8, col: 3 },
          { row: 8, col: 4 },
          { row: 8, col: 5 },
          { row: 9, col: 3 },
          { row: 9, col: 4 },
          { row: 9, col: 5 },
        ],
        color: "#10B981",
      },
    ],
    createdAt: "2023-05-01",
  },
];

// ===== ПОЛНЫЕ ТЕСТОВЫЕ ДАННЫЕ =====
export const testPlotData: Omit<
  PlotEditorState,
  "mode" | "view" | "selectedCells"
> = {
  plotSize: {
    start: { row: 0, col: 0 },
    end: { row: 15, col: 15 },
  },
  gridSize: 0.5,
  staticObjects: testStaticObjects,
  beds: testBeds,
  selectedBedId: null,
};

// ===== ЗОНЫ ОСВЕЩЕНИЯ (тестовые) =====
export const testSunZones = [
  {
    type: "full_sun",
    cells: [
      { row: 4, col: 3 },
      { row: 4, col: 4 },
      { row: 4, col: 5 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
    ],
    color: "rgba(255, 200, 0, 0.3)",
    label: "☀️ Полное солнце",
  },
  {
    type: "partial_shade",
    cells: [
      { row: 8, col: 3 },
      { row: 8, col: 4 },
      { row: 8, col: 5 },
      { row: 9, col: 3 },
      { row: 9, col: 4 },
      { row: 9, col: 5 },
    ],
    color: "rgba(200, 200, 0, 0.3)",
    label: "🌤️ Полутень",
  },
  {
    type: "full_shade",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    color: "rgba(100, 100, 100, 0.3)",
    label: "🌥️ Тень",
  },
];

// ===== КУЛЬТУРЫ ДЛЯ ПОСАДКИ =====
export const testCrops = [
  { id: "crop-1", name: "Томаты", vegetationDays: 90, color: "#EF4444" },
  { id: "crop-2", name: "Морковь", vegetationDays: 80, color: "#F59E0B" },
  { id: "crop-3", name: "Огурцы", vegetationDays: 60, color: "#22C55E" },
  { id: "crop-4", name: "Перец", vegetationDays: 100, color: "#EAB308" },
  { id: "crop-5", name: "Лук", vegetationDays: 70, color: "#A855F7" },
  { id: "crop-6", name: "Кабачки", vegetationDays: 55, color: "#10B981" },
  { id: "crop-7", name: "Свекла", vegetationDays: 75, color: "#EC4899" },
  { id: "crop-8", name: "Картофель", vegetationDays: 85, color: "#8B5CF6" },
];
