// src/components/plot/Toolbar/Toolbar.tsx
import React from 'react';
import styles from './Toolbar.module.css';

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

interface Bed {
  id: string;
  name: string;
  cells: GridPosition[];
  plantings: any[];
  createdAt: string;
}

interface ToolbarProps {
  selectedTool: 'select' | 'addBed' | 'addStatic' | 'resize';
  onToolSelect: (tool: 'select' | 'addBed' | 'addStatic' | 'resize') => void;
  onAddStaticObject: (rect: GridRect) => void;  // ← Исправлено: принимает GridRect
  onAddBed: (cells: GridPosition[]) => void;    // ← Исправлено: принимает массив клеток
  onUpdatePlotSize: (rect: GridRect) => void;
  isSelecting?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onAddStaticObject,
  onAddBed,
  onUpdatePlotSize,
  isSelecting = false,
}) => {
  // ===== ОБРАБОТЧИКИ =====
  const handleAddBed = () => {
    // Создаем тестовую грядку 3x3
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push({ row: r, col: c });
      }
    }
    onAddBed(cells);
    onToolSelect('select');
  };

  const handleAddStaticObject = () => {
    // Создаем тестовый объект 2x2
    const rect = {
      start: { row: 0, col: 0 },
      end: { row: 1, col: 1 },
    };
    onAddStaticObject(rect);
    onToolSelect('select');
  };

  const handleResize = () => {
    // Пример изменения размера участка
    const rect = {
      start: { row: 0, col: 0 },
      end: { row: 20, col: 20 },
    };
    onUpdatePlotSize(rect);
    onToolSelect('select');
  };

  return (
    <div className={styles.toolbar}>
      <button
        className={selectedTool === 'select' ? styles.active : ''}
        onClick={() => onToolSelect('select')}
        title="Выбрать объекты"
      >
        🖱️ Выбрать
      </button>

      <button
        className={selectedTool === 'addBed' ? styles.active : ''}
        onClick={() => {
          onToolSelect('addBed');
          if (selectedTool === 'addBed') {
            handleAddBed();
          }
        }}
        title="Создать грядку (выделите область на участке)"
      >
        📐 Грядка
        {selectedTool === 'addBed' && isSelecting && (
          <span className={styles.tooltip}>Выделите область на участке</span>
        )}
      </button>

      <button
        className={selectedTool === 'addStatic' ? styles.active : ''}
        onClick={() => {
          onToolSelect('addStatic');
          if (selectedTool === 'addStatic') {
            handleAddStaticObject();
          }
        }}
        title="Добавить стационарный объект (выделите область на участке)"
      >
        🏠 Объект
        {selectedTool === 'addStatic' && isSelecting && (
          <span className={styles.tooltip}>Выделите область на участке</span>
        )}
      </button>

      <button
        className={selectedTool === 'resize' ? styles.active : ''}
        onClick={handleResize}
        title="Изменить размер участка"
      >
        📏 Изменить участок
      </button>

      {selectedTool === 'addBed' && (
        <span className={styles.hint}>Выделите прямоугольную область на участке</span>
      )}
      {selectedTool === 'addStatic' && (
        <span className={styles.hint}>Выделите прямоугольную область на участке</span>
      )}
    </div>
  );
};

export default Toolbar;