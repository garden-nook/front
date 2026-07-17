// src/pages/PlotEditor/components/Canvas/GardenCanvas.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { testSunZones } from './testPlotData';
import ZoomControls from './ZoomControls';
import styles from './GardenCanvas.module.css';

// ===== ЛОКАЛЬНЫЕ ТИПЫ =====

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

interface SunZone {
  type: string;
  cells: GridPosition[];
  color: string;
  label: string;
}

interface GardenCanvasProps {
  plotSize: GridRect;
  gridSize: 0.5;
  staticObjects: StaticObject[];
  beds: Bed[];
  viewMode: 'planting' | 'sun';
  mode: 'view' | 'planting' | 'edit';
  selectedCells: GridPosition[];
  onCellClick: (row: number, col: number) => void;
  onRectSelect: (rect: GridRect) => void;
  onBedSelect: (bedId: string | null) => void;
  selectionMode?: boolean;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  plotSize,
  gridSize,
  staticObjects,
  beds,
  viewMode,
  mode,
  selectedCells,
  onCellClick,
  onRectSelect,
  onBedSelect,
  selectionMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ===== ФИКСИРОВАННЫЙ МАСШТАБ =====
  const scale = 1;
  const offset = { x: 0, y: 0 };

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [selectionStart, setSelectionStart] = useState<GridPosition | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<GridPosition | null>(null);

  const hasData = plotSize && plotSize.start && plotSize.end;

// ===== КОНВЕРТАЦИЯ КООРДИНАТ =====
// ===== КОНВЕРТАЦИЯ КООРДИНАТ =====
const gridToCanvas = useCallback((row: number, col: number) => {
  const cellSize = 20 * scale;
  return {
    x: col * cellSize + offset.x,
    y: row * cellSize + offset.y,
  };
}, [scale, offset]);

const getCellFromMouse = useCallback((mouseX: number, mouseY: number) => {
  if (!hasData) return null;
  
  const cellSize = 20 * scale;
  
  // ✅ Простое обратное преобразование
  const col = (mouseX - offset.x) / cellSize;
  const row = (mouseY - offset.y) / cellSize;
  
  // ✅ Округляем до ближайшей клетки
  const roundedCol = Math.round(col);
  const roundedRow = Math.round(row);
  
  // ✅ Проверяем границы участка
  if (roundedRow < plotSize.start.row || roundedRow > plotSize.end.row ||
      roundedCol < plotSize.start.col || roundedCol > plotSize.end.col) {
    return null;
  }
  
  return { row: roundedRow, col: roundedCol };
}, [plotSize, scale, offset, hasData]);

  // ===== ОТРИСОВКА =====
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return;
    
    // ✅ Очищаем с учетом dpr
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (!hasData) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Нет данных для отображения', rect.width / 2, rect.height / 2);
      return;
    }

    const cellSize = 20 * scale;
    const rows = plotSize.end.row - plotSize.start.row + 1;
    const cols = plotSize.end.col - plotSize.start.col + 1;

    // ===== 1. СЕТКА =====
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;

    for (let r = 0; r <= rows; r++) {
      const y = r * cellSize + offset.y;
      ctx.beginPath();
      ctx.moveTo(offset.x, y);
      ctx.lineTo(offset.x + cols * cellSize, y);
      ctx.stroke();
    }

    for (let c = 0; c <= cols; c++) {
      const x = c * cellSize + offset.x;
      ctx.beginPath();
      ctx.moveTo(x, offset.y);
      ctx.lineTo(x, offset.y + rows * cellSize);
      ctx.stroke();
    }

    // ===== 2. СТАЦИОНАРНЫЕ ОБЪЕКТЫ =====
    staticObjects.forEach((obj: StaticObject) => {
      if (!obj || !obj.rect) return;
      
      const start = gridToCanvas(obj.rect.start.row, obj.rect.start.col);
      const end = gridToCanvas(obj.rect.end.row + 1, obj.rect.end.col + 1);
      const width = end.x - start.x;
      const height = end.y - start.y;

      ctx.fillStyle = obj.color || '#8B7355';
      ctx.fillRect(start.x, start.y, width, height);
      
      ctx.strokeStyle = '#4a3728';
      ctx.lineWidth = 1;
      ctx.strokeRect(start.x, start.y, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.name, start.x + width / 2, start.y + height / 2);
    });

    // ===== 3. ЗОНЫ ОСВЕЩЕНИЯ =====
    if (viewMode === 'sun' && testSunZones) {
      (testSunZones as SunZone[]).forEach((zone: SunZone) => {
        if (!zone || !zone.cells) return;
        
        zone.cells.forEach((cell: GridPosition) => {
          const pos = gridToCanvas(cell.row, cell.col);
          ctx.fillStyle = zone.color;
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
        });
      });

      let legendY = 20;
      ctx.font = '11px system-ui';
      (testSunZones as SunZone[]).forEach((zone: SunZone) => {
        if (!zone) return;
        
        ctx.fillStyle = zone.color;
        ctx.fillRect(20, legendY, 16, 16);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, legendY, 16, 16);
        
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.label || '', 44, legendY + 8);
        legendY += 24;
      });
    }

    // ===== 4. ГРЯДКИ И ПОСАДКИ =====
    beds.forEach((bed: Bed) => {
      if (!bed || !bed.cells) return;
      
      bed.cells.forEach((cell: GridPosition) => {
        const pos = gridToCanvas(cell.row, cell.col);
        
        const activePlanting = bed.plantings && bed.plantings.find((planting: PlantingHistory) => 
          planting.cells && planting.cells.some((c: GridPosition) => c.row === cell.row && c.col === cell.col) &&
          !planting.harvestDate
        );

        if (activePlanting) {
          ctx.fillStyle = activePlanting.color || '#22c55e';
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌱', pos.x + cellSize / 2, pos.y + cellSize / 2);
        } else {
          ctx.fillStyle = '#f0fdf4';
          ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
        }

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
      });

      if (bed.cells && bed.cells.length > 0) {
        const firstCell = bed.cells[0];
        const pos = gridToCanvas(firstCell.row, firstCell.col);
        ctx.fillStyle = '#475569';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(bed.name || 'Грядка', pos.x + 2, pos.y - 2);
      }
    });

    // ===== 5. ВЫДЕЛЕНИЕ (селекшн) =====
    if (selectionMode && selectionStart && selectionEnd) {
      const startRow = Math.min(selectionStart.row, selectionEnd.row);
      const startCol = Math.min(selectionStart.col, selectionEnd.col);
      const endRow = Math.max(selectionStart.row, selectionEnd.row);
      const endCol = Math.max(selectionStart.col, selectionEnd.col);
      
      const start = gridToCanvas(startRow, startCol);
      const end = gridToCanvas(endRow + 1, endCol + 1);
      
      const width = end.x - start.x;
      const height = end.y - start.y;

      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.fillRect(start.x, start.y, width, height);
      
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(start.x, start.y, width, height);
      ctx.setLineDash([]);
      
      const rowsCount = endRow - startRow + 1;
      const colsCount = endCol - startCol + 1;
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${colsCount}×${rowsCount}`, start.x + width / 2, start.y - 4);
    }

    // ===== 6. ВЫДЕЛЕНИЕ (выбранные клетки) =====
    selectedCells.forEach((cell: GridPosition) => {
      const pos = gridToCanvas(cell.row, cell.col);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fillRect(pos.x, pos.y, cellSize, cellSize);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x, pos.y, cellSize, cellSize);
    });

    // ===== 7. ИНФОРМАЦИЯ =====
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Масштаб: ${Math.round(scale * 100)}%`, rect.width - 20, rect.height - 10);
    ctx.fillText(`Клетка: ${gridSize}м`, rect.width - 20, rect.height - 30);

  }, [plotSize, scale, offset, staticObjects, beds, viewMode, selectedCells, gridToCanvas, hasData, gridSize, selectionMode, selectionStart, selectionEnd]);

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
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [render]);

  // ===== ОБРАБОТЧИКИ МЫШИ =====
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cell = getCellFromMouse(x, y);
    if (!cell) return;

    if (selectionMode && (mode === 'edit')) {
      console.log('🖱️ MouseDown - cell:', cell);
      setSelectionStart(cell);
      setSelectionEnd(cell);
      return;
    }

    setDragStart({ x, y });
    setIsPanning(false);
  }, [getCellFromMouse, selectionMode, mode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (selectionMode && selectionStart && (mode === 'edit')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cell = getCellFromMouse(x, y);
      if (cell) {
        console.log('🖱️ MouseMove - cell:', cell);
        setSelectionEnd(cell);
      }
      return;
    }

    if (!dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsPanning(true);
      // ❌ Отключаем панорамирование для теста
      // if (mode === 'view' || e.buttons === 2 || mode === 'edit') {
      //   setOffset(prev => ({
      //     x: prev.x + dx,
      //     y: prev.y + dy,
      //   }));
      //   setDragStart({ x, y });
      // }
    }
  }, [dragStart, mode, selectionMode, selectionStart, getCellFromMouse]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (selectionMode && selectionStart && selectionEnd && (mode === 'edit')) {
      console.log('🖱️ MouseUp - selectionStart:', selectionStart);
      console.log('🖱️ MouseUp - selectionEnd:', selectionEnd);
      
      const start = {
        row: Math.min(selectionStart.row, selectionEnd.row),
        col: Math.min(selectionStart.col, selectionEnd.col),
      };
      const end = {
        row: Math.max(selectionStart.row, selectionEnd.row),
        col: Math.max(selectionStart.col, selectionEnd.col),
      };
      
      console.log('🖱️ MouseUp - final start:', start);
      console.log('🖱️ MouseUp - final end:', end);
      
      if (start.row !== end.row || start.col !== end.col) {
        onRectSelect({ start, end });
      }
      
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    if (!dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5 && !isPanning) {
      const cell = getCellFromMouse(x, y);
      if (cell) {
        if (mode === 'view') {
          const clickedBed = beds.find((bed: Bed) => 
            bed.cells.some((c: GridPosition) => c.row === cell.row && c.col === cell.col)
          );
          onBedSelect(clickedBed?.id || null);
        }
        if (mode === 'planting') {
          onCellClick(cell.row, cell.col);
        }
      }
    }
    
    setDragStart(null);
    setIsPanning(false);
  }, [dragStart, getCellFromMouse, mode, onCellClick, onBedSelect, beds, isPanning, selectionMode, selectionStart, selectionEnd, onRectSelect]);

  const handleMouseLeave = useCallback(() => {
    setDragStart(null);
    setIsPanning(false);
    if (selectionMode) {
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [selectionMode]);

  // ===== РЕНДЕР =====
  useEffect(() => {
    render();
  }, [render]);

  // ❌ Отключаем зум колесиком
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Ничего не делаем
  }, []);

  const cursorClass = selectionMode ? 'cursorCrosshair' : (mode === 'edit' ? 'cursorCrosshair' : 'cursorPointer');

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${styles[cursorClass]}`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className={styles.canvas}
      />

      {/* ❌ Отключаем ZoomControls */}
      {/* <div className={styles.zoomControls}>
        <ZoomControls
          scale={scale}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onReset={() => {}}
          minScale={0.3}
          maxScale={3}
        />
      </div> */}

      <div className={styles.tooltip}>
        {selectionMode && '📐 Выделите область на участке'}
        {!selectionMode && mode === 'view' && '👆 Кликните на грядку для просмотра истории • 🖱️ Перетаскивайте для перемещения • 🔄 Колесико для зума (отключен)'}
        {!selectionMode && mode === 'planting' && '🌱 Выберите культуру и кликните на клетку'}
        {!selectionMode && mode === 'edit' && '✏️ Выберите инструмент в панели снизу'}
      </div>
    </div>
  );
};

export default GardenCanvas;