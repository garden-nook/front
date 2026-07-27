// src/pages/PlotEditor/hooks/useGardenCanvas.ts
import { useRef, useState, useCallback, useEffect } from "react";
import type {
  GardenObject,
  UIBed,
  UIStaticObject,
  GridPosition,
  GridRect,
  Rect,
  Tool,
} from "../api/types/plot.types";
import { canvasStyles, staticObjectIcons } from "./canvasStyles";
import { useToast } from "../components/common/Toast";

interface UseGardenCanvasProps {
  plotSize: GridRect;
  gridSize: 0.5;
  objects: GardenObject[];
  selectedTool: Tool;
  selectedObject: GardenObject | null;
  hoveredObject: GardenObject | null;
  isDrawing: boolean;
  startCell: GridPosition | null;
  endCell: GridPosition | null;
  isDragging: boolean;
  dragOffset: { row: number; col: number } | null;
  scale: number;
  cols: number;
  rows: number;
  setScale: (scale: number) => void;
  onCellClick: (row: number, col: number) => void;
  onRectSelect: (rect: Rect) => void;
  onObjectSelect: (obj: GardenObject | null) => void;
  onObjectDelete: (id: string) => void;
  onContextMenu: (
    menu: { x: number; y: number; object: GardenObject } | null,
  ) => void;
  onHoverObject: (obj: GardenObject | null) => void;
  resetDrawing: () => void;
  setStartCell: (cell: GridPosition | null) => void;
  setEndCell: (cell: GridPosition | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setDragOffset: (offset: { row: number; col: number } | null) => void;
  onObjectUpdate?: (obj: GardenObject) => void;
  isMenuOpen?: boolean;
}

export const useGardenCanvas = ({
  plotSize,
  gridSize,
  objects,
  selectedTool,
  selectedObject,
  hoveredObject,
  isDrawing,
  startCell,
  endCell,
  isDragging,
  dragOffset,
  scale,
  cols,
  rows,
  setScale,
  onCellClick,
  onRectSelect,
  onObjectSelect,
  onObjectDelete,
  onContextMenu,
  onHoverObject,
  resetDrawing,
  setStartCell,
  setEndCell,
  setIsDrawing,
  setIsDragging,
  setDragOffset,
  onObjectUpdate,
  isMenuOpen = false,
}: UseGardenCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMiddleButtonDown, setIsMiddleButtonDown] = useState(false);

  const hasData = plotSize && plotSize.start && plotSize.end;
  const cellSizePx = canvasStyles.sizes.cellBaseSize * scale;

  // ===== ОГРАНИЧЕНИЕ ОФФСЕТА =====
  const clampOffset = useCallback(
    (newOffset: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container || !hasData) return newOffset;

      const rect = container.getBoundingClientRect();

      const maxOffsetX = rect.width / 2;
      const maxOffsetY = rect.height / 2;

      return {
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffset.x)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffset.y)),
      };
    },
    [cols, rows, cellSizePx, hasData],
  );

  // ===== ПОЛУЧЕНИЕ ПОЗИЦИИ УЧАСТКА =====
  const getPlotPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container)
      return { startX: 0, startY: 0, totalWidth: 0, totalHeight: 0 };

    const rect = container.getBoundingClientRect();
    const totalWidth = cols * cellSizePx;
    const totalHeight = rows * cellSizePx;

    const startX = (rect.width - totalWidth) / 2 + offset.x;
    const startY = (rect.height - totalHeight) / 2 + offset.y;

    return { startX, startY, totalWidth, totalHeight, rect };
  }, [cols, rows, cellSizePx, offset]);

  const getObjectAt = useCallback(
    (row: number, col: number): GardenObject | null => {
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (
          row >= obj.row &&
          row < obj.row + obj.height &&
          col >= obj.col &&
          col < obj.col + obj.width
        ) {
          return obj;
        }
      }
      return null;
    },
    [objects],
  );

  // ===== КОНВЕРТАЦИЯ КООРДИНАТ =====
  const gridToCanvas = useCallback(
    (row: number, col: number) => {
      const { startX, startY } = getPlotPosition();
      return {
        x: col * cellSizePx + startX,
        y: row * cellSizePx + startY,
      };
    },
    [cellSizePx, getPlotPosition],
  );

  // ===== ПОЛУЧЕНИЕ КЛЕТКИ ИЗ КООРДИНАТ МЫШИ =====
  const getCellFromMouse = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!hasData) return null;

      const { startX, startY, totalWidth, totalHeight } = getPlotPosition();

      if (
        mouseX < startX ||
        mouseX > startX + totalWidth ||
        mouseY < startY ||
        mouseY > startY + totalHeight
      ) {
        return null;
      }

      const offset = 0.001;
      const col = Math.floor((mouseX - startX) / cellSizePx + offset);
      const row = Math.floor((mouseY - startY) / cellSizePx + offset);

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
    [plotSize, cellSizePx, hasData, getPlotPosition],
  );

  // ===== ЦЕНТРИРОВАНИЕ (только при первой загрузке) =====
  const centerPlot = useCallback(() => {
    const container = containerRef.current;
    if (!container || !hasData) return;

    setOffset({ x: 0, y: 0 });
  }, [hasData]);

  useEffect(() => {
    centerPlot();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      render();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== ГЛОБАЛЬНАЯ БЛОКИРОВКА КОНТЕКСТНОГО МЕНЮ =====
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.body.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.body.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // ===== КУРСОР =====
  const getCursor = useCallback(() => {
    if (isPanning || isMiddleButtonDown) return "grabbing";

    if (selectedTool === "delete") return "not-allowed";
    if (selectedTool === "view" || selectedTool === "plant") return "default";
    if (selectedTool === "select") return "grab";
    if (selectedTool === "addBed" || selectedTool === "addStatic")
      return "crosshair";
    return "default";
  }, [isPanning, isMiddleButtonDown, selectedTool]);

  // ===== БЛОКИРОВКА CANVAS ПРИ ОТКРЫТОМ МЕНЮ =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isMenuOpen) {
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "0.9";
    } else {
      canvas.style.pointerEvents = "auto";
      canvas.style.opacity = "1";
    }
  }, [isMenuOpen]);

  // ===== ОБРАБОТЧИКИ МЫШИ =====
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMenuOpen) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (e.button === 1) {
        e.preventDefault();
        setIsMiddleButtonDown(true);
        setPanStart({ x, y });
        setIsPanning(true);
        return;
      }

      const cell = getCellFromMouse(x, y);

      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();

        if (cell) {
          const obj = getObjectAt(cell.row, cell.col);
          if (obj) {
            onContextMenu({ x: e.clientX, y: e.clientY, object: obj });
            onObjectSelect(obj);
            return;
          }
        }
        onContextMenu(null);
        return;
      }

      if (e.button === 0) {
        if (!cell) {
          if (selectedTool === "select") {
            onObjectSelect(null);
          }
          return;
        }

        if (selectedTool === "view") {
          const obj = getObjectAt(cell.row, cell.col);
          if (obj && obj.type === "bed") {
            onCellClick(cell.row, cell.col);
            onObjectSelect(obj);
          }
          return;
        }

        if (selectedTool === "plant") {
          const obj = getObjectAt(cell.row, cell.col);
          if (obj && obj.type === "bed") {
            onCellClick(cell.row, cell.col);
            onObjectSelect(obj);
          }
          return;
        }

        if (selectedTool === "select") {
          const obj = getObjectAt(cell.row, cell.col);
          if (obj) {
            onObjectSelect(obj);
            setIsDragging(true);
            setDragOffset({
              row: cell.row - obj.row,
              col: cell.col - obj.col,
            });
            return;
          }
          onObjectSelect(null);
          return;
        }

        if (selectedTool === "addStatic" || selectedTool === "addBed") {
          setIsDrawing(true);
          setStartCell(cell);
          setEndCell(cell);
          return;
        }

        if (selectedTool === "delete") {
          const obj = getObjectAt(cell.row, cell.col);
          if (obj) {
            onObjectDelete(obj.id);
          }
          return;
        }
      }
    },
    [
      selectedTool,
      getCellFromMouse,
      getObjectAt,
      onContextMenu,
      onObjectSelect,
      setIsDragging,
      setDragOffset,
      onObjectDelete,
      onCellClick,
      setStartCell,
      setEndCell,
      setIsDrawing,
      isMenuOpen,
    ],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMenuOpen) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cell = getCellFromMouse(x, y);

      if (isPanning && panStart) {
        const dx = x - panStart.x;
        const dy = y - panStart.y;

        const newOffset = clampOffset({
          x: offset.x + dx,
          y: offset.y + dy,
        });

        setOffset(newOffset);
        setPanStart({ x, y });
        return;
      }

      if (
        cell &&
        (selectedTool === "select" ||
          selectedTool === "view" ||
          selectedTool === "plant")
      ) {
        const obj = getObjectAt(cell.row, cell.col);
        if (obj?.id !== hoveredObject?.id) {
          onHoverObject(obj || null);
        }
      } else {
        if (hoveredObject) {
          onHoverObject(null);
        }
      }

      if (
        isDragging &&
        selectedObject &&
        dragOffset &&
        cell &&
        selectedTool === "select"
      ) {
        const newRow = cell.row - dragOffset.row;
        const newCol = cell.col - dragOffset.col;

        if (
          newRow < 0 ||
          newCol < 0 ||
          newRow + selectedObject.height > rows ||
          newCol + selectedObject.width > cols
        ) {
          return;
        }

        const otherObjects = objects.filter(
          (obj) => obj.id !== selectedObject.id,
        );
        const hasOverlap = otherObjects.some(
          (obj) =>
            !(
              obj.col + obj.width <= newCol ||
              newCol + selectedObject.width <= obj.col ||
              obj.row + obj.height <= newRow ||
              newRow + selectedObject.height <= obj.row
            ),
        );

        if (hasOverlap) return;

        const updatedObj = { ...selectedObject, row: newRow, col: newCol };
        onObjectSelect(updatedObj);

        if (onObjectUpdate) {
          onObjectUpdate(updatedObj);
        }
      }

      if (
        isDrawing &&
        cell &&
        (selectedTool === "addBed" || selectedTool === "addStatic")
      ) {
        setEndCell(cell);
      }
    },
    [
      isPanning,
      panStart,
      isDragging,
      selectedObject,
      dragOffset,
      getCellFromMouse,
      getObjectAt,
      selectedTool,
      rows,
      cols,
      objects,
      onHoverObject,
      hoveredObject,
      onObjectSelect,
      setEndCell,
      isDrawing,
      onObjectUpdate,
      offset,
      clampOffset,
      isMenuOpen,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isMenuOpen) return;

      if (e.button === 1) {
        setIsMiddleButtonDown(false);
        setIsPanning(false);
        setPanStart(null);
        return;
      }

      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
        return;
      }

      if (isDragging) {
        setIsDragging(false);
        setDragOffset(null);
        if (selectedObject && onObjectUpdate) {
          onObjectUpdate(selectedObject);
        }
        return;
      }

      if (!isDrawing) {
        resetDrawing();
        return;
      }

      if (
        startCell &&
        endCell &&
        (selectedTool === "addBed" || selectedTool === "addStatic")
      ) {
        const row = Math.min(startCell.row, endCell.row);
        const col = Math.min(startCell.col, endCell.col);
        const width = Math.abs(endCell.col - startCell.col) + 1;
        const height = Math.abs(endCell.row - startCell.row) + 1;

        if (width === 0 || height === 0) {
          resetDrawing();
          return;
        }

        const rect = { row, col, width, height };

        if (row < 0 || col < 0 || row + height > rows || col + width > cols) {
          resetDrawing();
          return;
        }

        const hasOverlap = objects.some(
          (obj) =>
            !(
              obj.col + obj.width <= col ||
              col + width <= obj.col ||
              obj.row + obj.height <= row ||
              row + height <= obj.row
            ),
        );

        if (hasOverlap) {
          const overlapping = objects.filter(
            (obj) =>
              !(
                obj.col + obj.width <= col ||
                col + width <= obj.col ||
                obj.row + obj.height <= row ||
                row + height <= obj.row
              ),
          );
          const names = overlapping.map((o) => o.name).join(", ");
          showToast(`Пересечение с: ${names}`, "error");
          resetDrawing();
          return;
        }

        onRectSelect(rect);
      }

      resetDrawing();
    },
    [
      isPanning,
      isDragging,
      isDrawing,
      startCell,
      endCell,
      objects,
      rows,
      cols,
      resetDrawing,
      onRectSelect,
      selectedObject,
      setIsDragging,
      setDragOffset,
      onObjectUpdate,
      selectedTool,
      isMenuOpen,
      showToast,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      setIsMiddleButtonDown(false);
    }
    if (isDrawing || isDragging) resetDrawing();
    onHoverObject(null);
  }, [isPanning, isDrawing, isDragging, resetDrawing, onHoverObject]);

  // ===== ЗУМ (колесико мыши) =====
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (isMenuOpen) return;
      if (isMiddleButtonDown || isPanning) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { startX, startY } = getPlotPosition();
      const worldX = (mouseX - startX) / cellSizePx;
      const worldY = (mouseY - startY) / cellSizePx;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.3, Math.min(3, scale + delta));

      const newCellSize = canvasStyles.sizes.cellBaseSize * newScale;
      const newTotalWidth = cols * newCellSize;
      const newTotalHeight = rows * newCellSize;

      let newOffsetX =
        mouseX - worldX * newCellSize - (rect.width - newTotalWidth) / 2;
      let newOffsetY =
        mouseY - worldY * newCellSize - (rect.height - newTotalHeight) / 2;

      const clamped = clampOffset({ x: newOffsetX, y: newOffsetY });
      newOffsetX = clamped.x;
      newOffsetY = clamped.y;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [
      scale,
      cellSizePx,
      cols,
      rows,
      getPlotPosition,
      setScale,
      isMiddleButtonDown,
      isPanning,
      clampOffset,
      isMenuOpen,
    ],
  );

  // ===== ОТРИСОВКА =====
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = canvasStyles.background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (!hasData) {
      ctx.fillStyle = canvasStyles.text.colors.secondary;
      ctx.font = `${canvasStyles.sizes.fontSize.medium}px ${canvasStyles.text.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Нет данных для отображения",
        rect.width / 2,
        rect.height / 2,
      );
      return;
    }

    const { startX, startY, totalWidth, totalHeight } = getPlotPosition();

    // СЕТКА
    ctx.strokeStyle = canvasStyles.grid.color;
    ctx.lineWidth = canvasStyles.grid.lineWidth;
    for (let r = 0; r <= rows; r++) {
      const y = startY + r * cellSizePx;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + totalWidth, y);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      const x = startX + c * cellSizePx;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + totalHeight);
      ctx.stroke();
    }

    // ОБЪЕКТЫ
    objects.forEach((obj) => {
      const x = startX + obj.col * cellSizePx;
      const y = startY + obj.row * cellSizePx;
      const width = obj.width * cellSizePx;
      const height = obj.height * cellSizePx;

      const isSelected = selectedObject?.id === obj.id;
      const isHovered = hoveredObject?.id === obj.id;

      ctx.fillStyle = obj.color;
      ctx.globalAlpha =
        obj.type === "bed"
          ? canvasStyles.objects.bed.fillAlpha
          : canvasStyles.objects.static.fillAlpha;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;

      if (isSelected) {
        ctx.strokeStyle = canvasStyles.objects.selected.strokeColor;
        ctx.lineWidth = canvasStyles.objects.selected.strokeWidth;
      } else if (obj.type === "bed") {
        ctx.strokeStyle = canvasStyles.objects.bed.strokeColor;
        ctx.lineWidth = canvasStyles.objects.bed.strokeWidth;
      } else {
        ctx.strokeStyle = canvasStyles.objects.static.strokeColor;
        ctx.lineWidth = canvasStyles.objects.static.strokeWidth;
      }

      let showHoverEffect = false;
      if (selectedTool === "select") {
        showHoverEffect = isHovered && !isSelected;
      } else if (selectedTool === "view" || selectedTool === "plant") {
        showHoverEffect = isHovered && !isSelected && obj.type === "bed";
      }

      if (showHoverEffect) {
        ctx.setLineDash(canvasStyles.objects.hovered.dashPattern);
      }
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      if (obj.type === "bed") {
        const bed = obj as UIBed;
        const activePlanting = bed.plantings?.find((p) => !p.harvestDate);
        if (activePlanting) {
          ctx.fillStyle = canvasStyles.text.colors.light;
          ctx.font = `${canvasStyles.sizes.fontSize.large}px ${canvasStyles.text.fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🌱", x + width / 2, y + height / 2 - 8);
          ctx.fillStyle = canvasStyles.text.colors.light;
          ctx.font = `${canvasStyles.sizes.fontSize.small}px ${canvasStyles.text.fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(
            activePlanting.cropName,
            x + width / 2,
            y + height / 2 + 16,
          );
        } else {
          ctx.fillStyle = canvasStyles.text.colors.light;
          ctx.font = `${canvasStyles.sizes.fontSize.medium}px ${canvasStyles.text.fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🌱", x + width / 2, y + height / 2 - 4);
          ctx.fillStyle = canvasStyles.text.colors.light;
          ctx.font = `${canvasStyles.sizes.fontSize.small}px ${canvasStyles.text.fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(bed.name, x + width / 2, y + height / 2 + 12);
        }
      } else {
        const staticObj = obj as UIStaticObject;
        const icon = staticObjectIcons[staticObj.subtype] || "📦";
        ctx.fillStyle = canvasStyles.text.colors.light;
        ctx.font = `${canvasStyles.sizes.fontSize.large}px ${canvasStyles.text.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, x + width / 2, y + height / 2 - 6);
        ctx.fillStyle = canvasStyles.text.colors.light;
        ctx.font = `${canvasStyles.sizes.fontSize.medium}px ${canvasStyles.text.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(obj.name, x + width / 2, y + height / 2 + 8);
      }
    });

    if (isDrawing && startCell && endCell) {
      const row = Math.min(startCell.row, endCell.row);
      const col = Math.min(startCell.col, endCell.col);
      const width = (Math.abs(endCell.col - startCell.col) + 1) * cellSizePx;
      const height = (Math.abs(endCell.row - startCell.row) + 1) * cellSizePx;
      const x = startX + col * cellSizePx;
      const y = startY + row * cellSizePx;

      ctx.fillStyle = canvasStyles.drawing.color;
      ctx.globalAlpha = canvasStyles.drawing.fillAlpha;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = canvasStyles.drawing.color;
      ctx.lineWidth = canvasStyles.drawing.strokeWidth;
      ctx.setLineDash(canvasStyles.drawing.dashPattern);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  }, [
    plotSize,
    objects,
    selectedObject,
    hoveredObject,
    isDrawing,
    startCell,
    endCell,
    scale,
    cols,
    rows,
    cellSizePx,
    gridSize,
    hasData,
    getPlotPosition,
    selectedTool,
  ]);

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
      render();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  return {
    canvasRef,
    containerRef,
    offset,
    setOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    getPlotPosition,
    getObjectAt,
    gridToCanvas,
    getCellFromMouse,
    centerPlot,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    render,
    getCursor,
  };
};

export default useGardenCanvas;
