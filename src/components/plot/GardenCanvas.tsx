import React, { useEffect } from "react";
import { useGardenCanvas } from "../../hooks/useGardenCanvas";
import type {
  GardenObject,
  GridPosition,
  GridRect,
  Rect,
  Tool,
} from "../../api/types/plot.types";

interface GardenCanvasProps {
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
  isMenuOpen?: boolean; // Добавляем пропс
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
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
  isMenuOpen = false, // Значение по умолчанию
}) => {
  const {
    canvasRef,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    getCursor,
  } = useGardenCanvas({
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
    isMenuOpen, // Передаем в хук
  });

  // Применяем курсор к canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = getCursor();
    }
  }, [getCursor, canvasRef]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default GardenCanvas;