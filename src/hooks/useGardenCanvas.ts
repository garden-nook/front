// src/pages/PlotEditor/components/Canvas/useGardenCanvas.ts
import { useCallback, useRef } from "react";

// ===== ЛОКАЛЬНЫЕ ТИПЫ (временные) =====

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

interface UseGardenCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  plotSize: GridRect;
  gridSize: 0.5;
  staticObjects: StaticObject[];
  beds: Bed[];
  viewMode: "planting" | "sun";
  selectedCells: GridPosition[];
  onCellClick: (row: number, col: number) => void;
}

export const useGardenCanvas = ({
  canvasRef,
  containerRef,
  plotSize,
  gridSize,
  staticObjects,
  beds,
  viewMode,
  selectedCells,
  onCellClick,
}: UseGardenCanvasProps) => {
  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  // Конвертация координат
  const gridToCanvas = useCallback((row: number, col: number) => {
    const cellSize = 20 * scale.current;
    return {
      x: col * cellSize + offset.current.x,
      y: row * cellSize + offset.current.y,
    };
  }, []);

  const getCellFromMouse = useCallback(
    (x: number, y: number) => {
      const cellSize = 20 * scale.current;
      const col = Math.floor((x - offset.current.x) / cellSize);
      const row = Math.floor((y - offset.current.y) / cellSize);

      // Проверка границ участка
      if (
        row < plotSize.start.row ||
        row > plotSize.end.row ||
        col < plotSize.start.col ||
        col > plotSize.end.col
      ) {
        return null;
      }

      return { row, col };
    },
    [plotSize],
  );

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const cellSize = 20 * scale.current;
    const rows = plotSize.end.row - plotSize.start.row + 1;
    const cols = plotSize.end.col - plotSize.start.col + 1;

    // 1. СЕТКА
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;

    for (let r = 0; r <= rows; r++) {
      const y = r * cellSize + offset.current.y;
      ctx.beginPath();
      ctx.moveTo(offset.current.x, y);
      ctx.lineTo(offset.current.x + cols * cellSize, y);
      ctx.stroke();
    }

    for (let c = 0; c <= cols; c++) {
      const x = c * cellSize + offset.current.x;
      ctx.beginPath();
      ctx.moveTo(x, offset.current.y);
      ctx.lineTo(x, offset.current.y + rows * cellSize);
      ctx.stroke();
    }

    // 2. СТАЦИОНАРНЫЕ ОБЪЕКТЫ
    staticObjects.forEach((obj) => {
      const start = gridToCanvas(obj.rect.start.row, obj.rect.start.col);
      const end = gridToCanvas(obj.rect.end.row + 1, obj.rect.end.col + 1);
      const width = end.x - start.x;
      const height = end.y - start.y;

      ctx.fillStyle = obj.color || "#8B7355";
      ctx.fillRect(start.x, start.y, width, height);

      ctx.strokeStyle = "#4a3728";
      ctx.lineWidth = 1;
      ctx.strokeRect(start.x, start.y, width, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(obj.name, start.x + width / 2, start.y + height / 2);
    });

    // 3. ЗОНЫ ОСВЕЩЕНИЯ (если включено)
    if (viewMode === "sun") {
      // TODO: добавить отрисовку зон освещения
      // Используйте testSunZones из testPlotData
    }

    // 4. ГРЯДКИ И ПОСАДКИ
    beds.forEach((bed) => {
      bed.cells.forEach((cell) => {
        const pos = gridToCanvas(cell.row, cell.col);

        const activePlanting = bed.plantings.find(
          (planting) =>
            planting.cells.some(
              (c) => c.row === cell.row && c.col === cell.col,
            ) && !planting.harvestDate,
        );

        if (activePlanting) {
          ctx.fillStyle = activePlanting.color || "#22c55e";
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);

          ctx.fillStyle = "#ffffff";
          ctx.font = "10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🌱", pos.x + cellSize / 2, pos.y + cellSize / 2);
        } else {
          ctx.fillStyle = "#f0fdf4";
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
        }

        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
      });

      if (bed.cells.length > 0) {
        const firstCell = bed.cells[0];
        const pos = gridToCanvas(firstCell.row, firstCell.col);
        ctx.fillStyle = "#475569";
        ctx.font = "10px system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(bed.name, pos.x + 2, pos.y - 2);
      }
    });

    // 5. ВЫДЕЛЕНИЕ
    selectedCells.forEach((cell) => {
      const pos = gridToCanvas(cell.row, cell.col);
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
    });

    // 6. ИНФОРМАЦИЯ О МАСШТАБЕ
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `Масштаб: ${Math.round(scale.current * 100)}%`,
      rect.width - 20,
      rect.height - 10,
    );
  }, [plotSize, staticObjects, beds, viewMode, selectedCells, gridToCanvas]);

  return {
    render,
    setScale: (s: number) => {
      scale.current = s;
      render();
    },
    setOffset: (x: number, y: number) => {
      offset.current = { x, y };
      render();
    },
    getCellFromMouse,
    getRectFromMouse: (x1: number, y1: number, x2: number, y2: number) => {
      const start = getCellFromMouse(x1, y1);
      const end = getCellFromMouse(x2, y2);
      if (!start || !end) return null;
      return {
        start: {
          row: Math.min(start.row, end.row),
          col: Math.min(start.col, end.col),
        },
        end: {
          row: Math.max(start.row, end.row),
          col: Math.max(start.col, end.col),
        },
      };
    },
  };
};

export default useGardenCanvas;
