// src/pages/PlotEditor/index.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PlotEditor.module.css';

// ===== ТИПЫ ОБЪЕКТОВ =====
type ObjectType = 'static' | 'bed';

interface BaseObject {
  id: string;
  row: number;
  col: number;
  width: number;
  height: number;
}

interface StaticObject extends BaseObject {
  type: 'static';
  name: string;
  color: string;
  subtype: 'building' | 'tree' | 'path' | 'water';
}

interface Planting {
  id: string;
  cropId: string;
  cropName: string;
  plantedDate: string;
  harvestDate?: string;
  cells: { row: number; col: number }[];
  color: string;
}

interface Bed extends BaseObject {
  type: 'bed';
  name: string;
  color: string;
  plantings: Planting[];
  createdAt: string;
}

type GardenObject = StaticObject | Bed;

// ===== ТЕСТОВЫЕ ДАННЫЕ КУЛЬТУР =====
const CROPS = [
  { id: 'crop-1', name: 'Томаты', vegetationDays: 90, color: '#EF4444' },
  { id: 'crop-2', name: 'Огурцы', vegetationDays: 60, color: '#22C55E' },
  { id: 'crop-3', name: 'Морковь', vegetationDays: 80, color: '#F59E0B' },
  { id: 'crop-4', name: 'Перец', vegetationDays: 100, color: '#EAB308' },
  { id: 'crop-5', name: 'Лук', vegetationDays: 70, color: '#A855F7' },
  { id: 'crop-6', name: 'Кабачки', vegetationDays: 55, color: '#10B981' },
  { id: 'crop-7', name: 'Свекла', vegetationDays: 75, color: '#EC4899' },
  { id: 'crop-8', name: 'Картофель', vegetationDays: 85, color: '#8B5CF6' },
];

// ===== ФУНКЦИИ ПРОВЕРКИ =====
const rectsOverlap = (
  a: { row: number; col: number; width: number; height: number },
  b: { row: number; col: number; width: number; height: number }
): boolean => {
  return !(a.col + a.width <= b.col ||
           b.col + b.width <= a.col ||
           a.row + a.height <= b.row ||
           b.row + b.height <= a.row);
};

const isWithinPlot = (
  rect: { row: number; col: number; width: number; height: number },
  rows: number,
  cols: number
): boolean => {
  return rect.row >= 0 &&
         rect.col >= 0 &&
         rect.row + rect.height <= rows &&
         rect.col + rect.width <= cols;
};

const findOverlaps = (
  newRect: { row: number; col: number; width: number; height: number },
  objects: GardenObject[]
): GardenObject[] => {
  return objects.filter(obj => rectsOverlap(newRect, obj));
};

const isPointInRect = (
  row: number,
  col: number,
  obj: { row: number; col: number; width: number; height: number }
): boolean => {
  return row >= obj.row &&
         row < obj.row + obj.height &&
         col >= obj.col &&
         col < obj.col + obj.width;
};

export const PlotEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Параметры участка
  const [plotWidth, setPlotWidth] = useState(10);
  const [plotHeight, setPlotHeight] = useState(10);
  const cellSizeMeters = 0.5;

  // Отображение
  const [scale, setScale] = useState(1);
  const [objects, setObjects] = useState<GardenObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'addStatic' | 'addBed' | 'delete' | 'plant'>('select');
  const [selectedSubtype, setSelectedSubtype] = useState<StaticObject['subtype']>('building');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [endCell, setEndCell] = useState<{ row: number; col: number } | null>(null);

  // Перетаскивание
  const [isDragging, setIsDragging] = useState(false);
  const [selectedObject, setSelectedObject] = useState<GardenObject | null>(null);
  const [dragOffset, setDragOffset] = useState<{ row: number; col: number } | null>(null);
  const [hoveredObject, setHoveredObject] = useState<GardenObject | null>(null);

  // Контекстное меню
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    object: GardenObject;
  } | null>(null);

  // Модальное окно редактирования
  const [editModal, setEditModal] = useState<{
    object: GardenObject;
    name: string;
    width: number;
    height: number;
  } | null>(null);

  // Режим посадки
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [plantingModal, setPlantingModal] = useState<{
    bed: Bed;
    cropId: string;
    plantedDate: string;
  } | null>(null);

  // Константы
  const staticColors: Record<StaticObject['subtype'], string> = {
    building: '#8B7355',
    tree: '#2E7D32',
    path: '#D2B48C',
    water: '#4A90D9',
  };

  const staticLabels: Record<StaticObject['subtype'], string> = {
    building: '🏠 Дом',
    tree: '🌳 Дерево',
    path: '🛤️ Дорожка',
    water: '💧 Вода',
  };

  const staticIcons: Record<StaticObject['subtype'], string> = {
    building: '🏠',
    tree: '🌳',
    path: '🛤️',
    water: '💧',
  };

  // Расчеты
  const cols = Math.round(plotWidth / cellSizeMeters);
  const rows = Math.round(plotHeight / cellSizeMeters);
  const cellSizePx = 20 * scale;

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const resetDrawing = useCallback(() => {
    setIsDrawing(false);
    setStartCell(null);
    setEndCell(null);
    setIsDragging(false);
    setSelectedObject(null);
    setDragOffset(null);
  }, []);

  const getObjectAt = useCallback((row: number, col: number): GardenObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (isPointInRect(row, col, obj)) {
        return obj;
      }
    }
    return null;
  }, [objects]);

  const getBedAt = useCallback((row: number, col: number): Bed | null => {
    const obj = getObjectAt(row, col);
    if (obj && obj.type === 'bed') {
      return obj as Bed;
    }
    return null;
  }, [getObjectAt]);

  // ===== ПОЛУЧЕНИЕ КЛЕТКИ =====
  const getCellFromMouse = useCallback((mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const rect = container.getBoundingClientRect();
    const totalWidth = cols * cellSizePx;
    const totalHeight = rows * cellSizePx;
    const startX = (rect.width - totalWidth) / 2;
    const startY = (rect.height - totalHeight) / 2;

    if (mouseX < startX || mouseX > startX + totalWidth ||
        mouseY < startY || mouseY > startY + totalHeight) {
      return null;
    }

    const col = Math.floor((mouseX - startX) / cellSizePx);
    const row = Math.floor((mouseY - startY) / cellSizePx);

    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }, [cols, rows, cellSizePx]);

  // ===== СОЗДАНИЕ ОБЪЕКТОВ =====
  const createStaticObject = useCallback((
    rect: { row: number; col: number; width: number; height: number },
    subtype: StaticObject['subtype']
  ): StaticObject => {
    return {
      id: `static-${Date.now()}`,
      type: 'static',
      subtype,
      name: staticLabels[subtype].replace(/[🏠🌳🛤️💧]\s*/, ''),
      color: staticColors[subtype],
      ...rect,
    };
  }, [staticLabels, staticColors]);

  const createBed = useCallback((
    rect: { row: number; col: number; width: number; height: number },
    name: string
  ): Bed => {
    const cells: { row: number; col: number }[] = [];
    for (let r = rect.row; r < rect.row + rect.height; r++) {
      for (let c = rect.col; c < rect.col + rect.width; c++) {
        cells.push({ row: r, col: c });
      }
    }

    return {
      id: `bed-${Date.now()}`,
      type: 'bed',
      name: name || `Грядка ${objects.filter(o => o.type === 'bed').length + 1}`,
      color: '#22c55e',
      ...rect,
      plantings: [],
      createdAt: new Date().toISOString(),
    };
  }, [objects]);

  // ===== УДАЛЕНИЕ ОБЪЕКТА =====
  const deleteObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    setSelectedObject(null);
    setContextMenu(null);
  }, []);

  // ===== РЕДАКТИРОВАНИЕ ОБЪЕКТА =====
  const openEditModal = useCallback((obj: GardenObject) => {
    setEditModal({
      object: obj,
      name: obj.name,
      width: obj.width,
      height: obj.height,
    });
    setContextMenu(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editModal) return;

    const { object, name, width, height } = editModal;

    if (width < 1 || height < 1) {
      alert('Размеры должны быть больше 0');
      return;
    }

    const newRect = {
      row: object.row,
      col: object.col,
      width,
      height,
    };

    if (!isWithinPlot(newRect, rows, cols)) {
      alert('Объект выходит за границы участка!');
      return;
    }

    const otherObjects = objects.filter(obj => obj.id !== object.id);
    const overlaps = findOverlaps(newRect, otherObjects);
    if (overlaps.length > 0) {
      const names = overlaps.map(o => o.name).join(', ');
      alert(`❌ Пересечение с: ${names}`);
      return;
    }

    setObjects(prev => prev.map(obj => 
      obj.id === object.id
        ? { ...obj, name, width, height }
        : obj
    ));

    setEditModal(null);
  }, [editModal, objects, rows, cols]);

  // ===== ПОСАДКА =====
  const openPlantingModal = useCallback((bed: Bed) => {
    setPlantingModal({
      bed,
      cropId: CROPS[0].id,
      plantedDate: new Date().toISOString().split('T')[0],
    });
    setContextMenu(null);
  }, []);

  const savePlanting = useCallback(() => {
    if (!plantingModal) return;

    const { bed, cropId, plantedDate } = plantingModal;
    const crop = CROPS.find(c => c.id === cropId);
    if (!crop) return;

    // Получаем все клетки грядки
    const cells: { row: number; col: number }[] = [];
    for (let r = bed.row; r < bed.row + bed.height; r++) {
      for (let c = bed.col; c < bed.col + bed.width; c++) {
        cells.push({ row: r, col: c });
      }
    }

    // Проверяем, есть ли уже активная посадка на этих клетках
    const hasActivePlanting = bed.plantings.some(p => 
      !p.harvestDate && p.cells.some(c => 
        cells.some(bc => bc.row === c.row && bc.col === c.col)
      )
    );

    if (hasActivePlanting) {
      alert('На этой грядке уже есть активная посадка!');
      return;
    }

    const newPlanting: Planting = {
      id: `plant-${Date.now()}`,
      cropId: crop.id,
      cropName: crop.name,
      plantedDate,
      cells,
      color: crop.color,
    };

    setObjects(prev => prev.map(obj => 
      obj.id === bed.id
        ? { ...obj, plantings: [...(obj as Bed).plantings, newPlanting] }
        : obj
    ));

    setPlantingModal(null);
    setSelectedBed(null);
  }, [plantingModal]);

  // ===== ОТРИСОВКА =====
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Фон
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Позиция участка
    const totalWidth = cols * cellSizePx;
    const totalHeight = rows * cellSizePx;
    const startX = (rect.width - totalWidth) / 2;
    const startY = (rect.height - totalHeight) / 2;

    // ===== СЕТКА =====
    for (let r = 0; r <= rows; r++) {
      const y = startY + r * cellSizePx;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + totalWidth, y);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    for (let c = 0; c <= cols; c++) {
      const x = startX + c * cellSizePx;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + totalHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ===== ОБЪЕКТЫ =====
    objects.forEach(obj => {
      const x = startX + obj.col * cellSizePx;
      const y = startY + obj.row * cellSizePx;
      const width = obj.width * cellSizePx;
      const height = obj.height * cellSizePx;

      const isSelected = selectedObject?.id === obj.id;
      const isHovered = hoveredObject?.id === obj.id;

      // Заливка
      ctx.fillStyle = obj.color;
      ctx.globalAlpha = obj.type === 'bed' ? 0.3 : 0.7;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;

      // Рамка
      ctx.strokeStyle = isSelected ? '#2563eb' : (obj.type === 'bed' ? '#22c55e' : '#1e293b');
      ctx.lineWidth = isSelected ? 3 : (obj.type === 'bed' ? 2 : 1);
      
      if (isHovered && !isSelected) {
        ctx.setLineDash([4, 4]);
      }
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      // Если грядка, показываем посадки
      if (obj.type === 'bed' && obj.plantings.length > 0) {
        const bed = obj as Bed;
        const activePlanting = bed.plantings.find(p => !p.harvestDate);
        
        if (activePlanting) {
          // Показываем иконку культуры на грядке
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌱', x + width / 2, y + height / 2 - 8);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(activePlanting.cropName, x + width / 2, y + height / 2 + 16);
        }
      } else {
        // Иконка и название для стационарных объектов
        let icon = '📦';
        if (obj.type === 'static') {
          icon = staticIcons[obj.subtype];
        } else {
          icon = '🌱';
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x + width / 2, y + height / 2 - 6);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(obj.name, x + width / 2, y + height / 2 + 8);

        if (obj.type === 'bed') {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${obj.width}×${obj.height}`, x + width / 2, y + height - 2);
        }
      }
    });

    // ===== ВЫДЕЛЕНИЕ ПРИ РИСОВАНИИ =====
    if (isDrawing && startCell && endCell) {
      const row = Math.min(startCell.row, endCell.row);
      const col = Math.min(startCell.col, endCell.col);
      const width = (Math.abs(endCell.col - startCell.col) + 1) * cellSizePx;
      const height = (Math.abs(endCell.row - startCell.row) + 1) * cellSizePx;

      const x = startX + col * cellSizePx;
      const y = startY + row * cellSizePx;

      const tempRect = {
        row,
        col,
        width: Math.abs(endCell.col - startCell.col) + 1,
        height: Math.abs(endCell.row - startCell.row) + 1,
      };

      const overlaps = findOverlaps(tempRect, objects);
      const isInside = isWithinPlot(tempRect, rows, cols);
      const canPlace = isInside && overlaps.length === 0;

      const color = canPlace ? '#22c55e' : '#ef4444';
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const sizeText = `${tempRect.width}×${tempRect.height} клеток`;
      const statusText = canPlace ? '✅ Можно разместить' : '❌ Пересечение или за границей';
      ctx.fillText(`${sizeText} — ${statusText}`, x, y - 4);
    }

    // ===== ИНФОРМАЦИЯ =====
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const staticCount = objects.filter(o => o.type === 'static').length;
    const bedCount = objects.filter(o => o.type === 'bed').length;
    ctx.fillText(`Участок: ${plotWidth}×${plotHeight}м | Клетка: ${cellSizeMeters}м | Сетка: ${cols}×${rows}`, 10, 10);
    ctx.fillText(`Объектов: ${objects.length} (🏠 ${staticCount}, 🌱 ${bedCount})`, 10, 28);
    if (selectedObject) {
      ctx.fillStyle = '#2563eb';
      ctx.fillText(`Выбран: ${selectedObject.name} (${selectedObject.width}×${selectedObject.height})`, 10, 46);
    }

  }, [plotWidth, plotHeight, scale, cellSizePx, cols, rows, objects, isDrawing, startCell, endCell, staticIcons, selectedObject, hoveredObject]);

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // ===== ОБРАБОТЧИКИ МЫШИ =====
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cell = getCellFromMouse(mouseX, mouseY);
    if (!cell) return;

    // Правый клик — контекстное меню
    if (e.button === 2) {
      const obj = getObjectAt(cell.row, cell.col);
      if (obj) {
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          object: obj,
        });
        setSelectedObject(obj);
        return;
      } else {
        setContextMenu(null);
        return;
      }
    }

    // Левый клик — закрываем контекстное меню
    setContextMenu(null);

    // Режим посадки
    if (selectedTool === 'plant') {
      const bed = getBedAt(cell.row, cell.col);
      if (bed) {
        setSelectedBed(bed);
        // Показываем информацию о грядке слева (в UI)
        return;
      } else {
        setSelectedBed(null);
        return;
      }
    }

    // Режим удаления
    if (selectedTool === 'delete') {
      const obj = getObjectAt(cell.row, cell.col);
      if (obj) {
        deleteObject(obj.id);
      }
      return;
    }

    // Режим выделения и перетаскивания
    if (selectedTool === 'select') {
      const obj = getObjectAt(cell.row, cell.col);
      if (obj) {
        setSelectedObject(obj);
        setIsDragging(true);
        setDragOffset({
          row: cell.row - obj.row,
          col: cell.col - obj.col,
        });
        return;
      } else {
        setSelectedObject(null);
        return;
      }
    }

    // Режим добавления
    if (selectedTool === 'addStatic' || selectedTool === 'addBed') {
      setIsDrawing(true);
      setStartCell(cell);
      setEndCell(cell);
    }
  }, [selectedTool, getCellFromMouse, getObjectAt, getBedAt, deleteObject]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cell = getCellFromMouse(mouseX, mouseY);

    // Обновление наведения
    if (cell && (selectedTool === 'select' || selectedTool === 'plant')) {
      const obj = getObjectAt(cell.row, cell.col);
      setHoveredObject(obj);
    } else {
      setHoveredObject(null);
    }

    // Перетаскивание
    if (isDragging && selectedObject && dragOffset && cell) {
      const newRow = cell.row - dragOffset.row;
      const newCol = cell.col - dragOffset.col;

      const newRect = {
        row: newRow,
        col: newCol,
        width: selectedObject.width,
        height: selectedObject.height,
      };

      if (!isWithinPlot(newRect, rows, cols)) {
        return;
      }

      const otherObjects = objects.filter(obj => obj.id !== selectedObject.id);
      const overlaps = findOverlaps(newRect, otherObjects);
      if (overlaps.length > 0) {
        return;
      }

      setObjects(prev => prev.map(obj => 
        obj.id === selectedObject.id
          ? { ...obj, row: newRow, col: newCol }
          : obj
      ));
    }

    // Рисование
    if (isDrawing && cell) {
      setEndCell(cell);
    }
  }, [isDragging, selectedObject, dragOffset, getCellFromMouse, getObjectAt, objects, rows, cols, isDrawing, selectedTool]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(null);
      return;
    }

    if (!isDrawing || selectedTool === 'select' || selectedTool === 'plant') {
      resetDrawing();
      return;
    }

    if (startCell && endCell) {
      const row = Math.min(startCell.row, endCell.row);
      const col = Math.min(startCell.col, endCell.col);
      const width = Math.abs(endCell.col - startCell.col) + 1;
      const height = Math.abs(endCell.row - startCell.row) + 1;

      const newRect = { row, col, width, height };

      if (!isWithinPlot(newRect, rows, cols)) {
        alert('❌ Объект выходит за границы участка!');
        resetDrawing();
        return;
      }

      const overlaps = findOverlaps(newRect, objects);
      if (overlaps.length > 0) {
        const names = overlaps.map(o => o.name).join(', ');
        alert(`❌ Пересечение с: ${names}`);
        resetDrawing();
        return;
      }

      let newObject: GardenObject | null = null;

      if (selectedTool === 'addStatic') {
        newObject = createStaticObject(newRect, selectedSubtype);
      } else if (selectedTool === 'addBed') {
        const defaultName = `Грядка ${objects.filter(o => o.type === 'bed').length + 1}`;
        const bedName = prompt('Введите название грядки:', defaultName);
        if (bedName === null) {
          resetDrawing();
          return;
        }
        newObject = createBed(newRect, bedName || defaultName);
      }

      if (newObject) {
        setObjects(prev => [...prev, newObject]);
      }
    }

    resetDrawing();
  }, [isDrawing, isDragging, selectedTool, startCell, endCell, objects, rows, cols, selectedSubtype, createStaticObject, createBed, resetDrawing]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing || isDragging) {
      resetDrawing();
    }
    setHoveredObject(null);
  }, [isDrawing, isDragging, resetDrawing]);

  // ===== КОНТЕКСТНОЕ МЕНЮ =====
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ===== КЛАВИАТУРА =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject && selectedTool === 'select') {
        deleteObject(selectedObject.id);
      }
      if (e.key === 'Escape') {
        setSelectedObject(null);
        resetDrawing();
        setContextMenu(null);
        setEditModal(null);
        setPlantingModal(null);
        setSelectedBed(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, selectedTool, deleteObject, resetDrawing]);



  useEffect(() => {
  if (selectedBed) {
    const updated = objects.find(obj => obj.id === selectedBed.id) as Bed | undefined;
    if (updated) {
      setSelectedBed(updated);
    } else {
      setSelectedBed(null);
    }
  }
}, [objects, selectedBed?.id]);

// ===== СБОР УРОЖАЯ =====
const handleHarvest = useCallback((bedId: string, plantingId: string) => {
  setObjects(prev => prev.map(obj => {
    if (obj.type === 'bed' && obj.id === bedId) {
      const bed = obj as Bed;
      return {
        ...bed,
        plantings: bed.plantings.map(p => 
          p.id === plantingId ? { ...p, harvestDate: new Date().toISOString().split('T')[0] } : p
        )
      };
    }
    return obj;
  }));
}, []);


  // ===== РЕНДЕР МОДАЛЬНЫХ ОКОН =====

  // Контекстное меню
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div 
        className={styles.contextMenu}
        style={{
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          zIndex: 1000,
        }}
      >
        {contextMenu.object.type === 'bed' && (
          <button onClick={() => openPlantingModal(contextMenu.object as Bed)}>
            🌱 Посадить
          </button>
        )}
        <button onClick={() => openEditModal(contextMenu.object)}>
          ✏️ Редактировать
        </button>
        <button 
          className={styles.danger}
          onClick={() => deleteObject(contextMenu.object.id)}
        >
          🗑️ Удалить
        </button>
      </div>
    );
  };

  // Модальное окно редактирования
  const renderEditModal = () => {
    if (!editModal) return null;

    return (
      <div className={styles.modalOverlay} onClick={(e) => {
        if (e.target === e.currentTarget) setEditModal(null);
      }}>
        <div className={styles.modal}>
          <h3>Редактировать объект</h3>
          
          <div className={styles.modalField}>
            <label>Название:</label>
            <input
              type="text"
              value={editModal.name}
              onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
            />
          </div>

          <div className={styles.modalField}>
            <label>Ширина (клеток):</label>
            <input
              type="number"
              value={editModal.width}
              onChange={(e) => setEditModal({ ...editModal, width: Number(e.target.value) })}
              min={1}
              step={1}
            />
          </div>

          <div className={styles.modalField}>
            <label>Высота (клеток):</label>
            <input
              type="number"
              value={editModal.height}
              onChange={(e) => setEditModal({ ...editModal, height: Number(e.target.value) })}
              min={1}
              step={1}
            />
          </div>

          <div className={styles.modalActions}>
            <button onClick={() => setEditModal(null)}>Отмена</button>
            <button className={styles.primary} onClick={saveEdit}>Сохранить</button>
          </div>
        </div>
      </div>
    );
  };

  // Модальное окно посадки
  const renderPlantingModal = () => {
    if (!plantingModal) return null;

    return (
      <div className={styles.modalOverlay} onClick={(e) => {
        if (e.target === e.currentTarget) setPlantingModal(null);
      }}>
        <div className={styles.modal}>
          <h3>🌱 Посадка на грядку "{plantingModal.bed.name}"</h3>
          
          <div className={styles.modalField}>
            <label>Культура:</label>
            <select
              value={plantingModal.cropId}
              onChange={(e) => setPlantingModal({ ...plantingModal, cropId: e.target.value })}
            >
              {CROPS.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.vegetationDays} дн.)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalField}>
            <label>Дата посадки:</label>
            <input
              type="date"
              value={plantingModal.plantedDate}
              onChange={(e) => setPlantingModal({ ...plantingModal, plantedDate: e.target.value })}
            />
          </div>

          <div className={styles.modalActions}>
            <button onClick={() => setPlantingModal(null)}>Отмена</button>
            <button className={styles.primary} onClick={savePlanting}>Посадить</button>
          </div>
        </div>
      </div>
    );
  };

  // Информационная панель для режима посадки
 const renderPlantingInfo = () => {
  if (selectedTool !== 'plant') return null;
  
  // Ищем актуальную грядку в объектах
  const currentBed = selectedBed 
    ? objects.find(obj => obj.type === 'bed' && obj.id === selectedBed.id) as Bed | undefined
    : null;

  if (!currentBed) {
    return (
      <div className={styles.plantingInfoPanel}>
        <h4>🌱 Режим посадки</h4>
        <p className={styles.hint}>Кликните на грядку для просмотра информации</p>
        {selectedBed && (
          <p className={styles.hint} style={{ color: '#ef4444' }}>
            Грядка не найдена (возможно, была удалена)
          </p>
        )}
      </div>
    );
  }

  const activePlanting = currentBed.plantings.find(p => !p.harvestDate);
  const crop = activePlanting ? CROPS.find(c => c.id === activePlanting.cropId) : null;

  return (
    <div className={styles.plantingInfoPanel}>
      <h4>🌱 {currentBed.name}</h4>
      <div className={styles.plantingInfoSize}>
        Размер: {currentBed.width}×{currentBed.height} клеток
      </div>
      
      {activePlanting && crop ? (
        <>
          <div className={styles.plantingInfoRow}>
            <span className={styles.label}>Культура:</span>
            <span className={styles.value} style={{ color: crop.color }}>
              {crop.name}
            </span>
          </div>
          <div className={styles.plantingInfoRow}>
            <span className={styles.label}>Дата посадки:</span>
            <span className={styles.value}>
              {new Date(activePlanting.plantedDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className={styles.plantingInfoRow}>
            <span className={styles.label}>Плановый сбор:</span>
            <span className={styles.value}>
              {new Date(new Date(activePlanting.plantedDate).getTime() + crop.vegetationDays * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className={styles.plantingInfoRow}>
            <span className={styles.label}>Статус:</span>
            <span className={styles.value} style={{ color: '#22c55e' }}>
              🌱 Растет
            </span>
          </div>
          <button 
            className={styles.harvestButton}
            onClick={() => {
              if (confirm(`Собрать урожай "${crop.name}" с грядки "${currentBed.name}"?`)) {
                handleHarvest(currentBed.id, activePlanting.id);
              }
            }}
          >
            🌾 Собрать урожай
          </button>
        </>
      ) : (
        <>
          <p className={styles.hint}>Грядка пуста</p>
          <p className={styles.hintSmall}>Нажмите правой кнопкой на грядку для посадки</p>
        </>
      )}

      {/* История посадок */}
      {currentBed.plantings.length > 0 && (
        <div className={styles.historySection}>
          <h5>📋 История посадок:</h5>
          {[...currentBed.plantings]
            .sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime())
            .map(p => {
              const cropInfo = CROPS.find(c => c.id === p.cropId);
              const isActive = !p.harvestDate;
              return (
                <div key={p.id} className={`${styles.historyItem} ${isActive ? styles.active : styles.harvested}`}>
                  <span className={styles.historyDot} style={{ backgroundColor: cropInfo?.color || '#888' }} />
                  <span className={styles.historyCrop}>{cropInfo?.name || p.cropName}</span>
                  <span className={styles.historyDate}>
                    📅 {new Date(p.plantedDate).toLocaleDateString('ru-RU')}
                  </span>
                  {p.harvestDate && (
                    <span className={styles.historyHarvest}>
                      ✅ Собрано {new Date(p.harvestDate).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {isActive && (
                    <span className={styles.historyActive}>🌱 Активна</span>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {currentBed.plantings.length === 0 && (
        <div className={styles.historySection}>
          <p className={styles.hintSmall}>История посадок пуста</p>
        </div>
      )}
    </div>
  );
};

  return (
    <div className={styles.container}>
      {/* Управление */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>
            Ширина (м):
            <input
              type="number"
              value={plotWidth}
              onChange={(e) => setPlotWidth(Number(e.target.value))}
              min={0.5}
              step={0.5}
            />
          </label>
          <label>
            Высота (м):
            <input
              type="number"
              value={plotHeight}
              onChange={(e) => setPlotHeight(Number(e.target.value))}
              min={0.5}
              step={0.5}
            />
          </label>
        </div>

        <div className={styles.controlGroup}>
          <label>
            Масштаб:
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
            <span>{Math.round(scale * 100)}%</span>
          </label>
        </div>

        <div className={styles.controlGroup}>
          <button
            className={selectedTool === 'select' ? styles.active : ''}
            onClick={() => setSelectedTool('select')}
          >
            🖱️ Выбрать
          </button>

          <button
            className={selectedTool === 'plant' ? styles.active : ''}
            onClick={() => setSelectedTool(selectedTool === 'plant' ? 'select' : 'plant')}
          >
            🌱 Посадка
          </button>

          <div className={styles.submenu}>
            <button
              className={selectedTool === 'addStatic' ? styles.active : ''}
              onClick={() => setSelectedTool(selectedTool === 'addStatic' ? 'select' : 'addStatic')}
            >
              🏠 Объект
            </button>
            {selectedTool === 'addStatic' && (
              <div className={styles.submenuItems}>
                {(['building', 'tree', 'path', 'water'] as const).map(subtype => (
                  <button
                    key={subtype}
                    className={selectedSubtype === subtype ? styles.active : ''}
                    onClick={() => setSelectedSubtype(subtype)}
                  >
                    {staticLabels[subtype]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={selectedTool === 'addBed' ? styles.active : ''}
            onClick={() => setSelectedTool(selectedTool === 'addBed' ? 'select' : 'addBed')}
          >
            🌱 Грядка
          </button>

          <button
            className={selectedTool === 'delete' ? styles.active : ''}
            onClick={() => setSelectedTool(selectedTool === 'delete' ? 'select' : 'delete')}
          >
            🗑️ Удалить
          </button>

          <button onClick={() => {
            if (window.confirm('Удалить все объекты?')) {
              setObjects([]);
              setSelectedObject(null);
            }
          }}>
            🧹 Очистить всё
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className={styles.mainContent}>
        {/* Информационная панель режима посадки */}
        {renderPlantingInfo()}

        {/* Холст */}
        <div ref={containerRef} className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={(e) => e.preventDefault()}
            className={styles.canvas}
            style={{ 
              cursor: selectedTool === 'select' ? 'pointer' : 
                      selectedTool === 'delete' ? 'not-allowed' : 
                      selectedTool === 'plant' ? 'pointer' :
                      'crosshair'
            }}
          />
        </div>
      </div>

      {/* Контекстное меню */}
      {renderContextMenu()}

      {/* Модальное окно редактирования */}
      {renderEditModal()}

      {/* Модальное окно посадки */}
      {renderPlantingModal()}
    </div>
  );
};

export default PlotEditor;