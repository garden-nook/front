// src/pages/PlotEditor/index.tsx
import React, { useState, useEffect } from 'react';
import styles from './PlotEditor.module.css';
import { loadPlotData, savePlotData } from '../utils/plotStorage';
import { testCrops } from '../components/plot/testPlotData';
import { ModeSwitch } from '../components/plot/controls/ModeSwitch';
import { ViewSwitch } from '../components/plot/controls/ViewSwitch';
import PlantingHistory from '../components/plot/PlantingHistory';
import GardenCanvas from '../components/plot/GardenCanvas';
import Toolbar from '../components/plot/Toolbar';


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

interface PlantingHistoryItem {
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
  plantings: PlantingHistoryItem[];
  createdAt: string;
}

interface PlotEditorState {
  plotSize: GridRect;
  gridSize: 0.5;
  staticObjects: StaticObject[];
  beds: Bed[];
  selectedBedId: string | null;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

const rectsOverlap = (a: GridRect, b: GridRect): boolean => {
  return !(a.end.row < b.start.row || 
          a.start.row > b.end.row ||
          a.end.col < b.start.col || 
          a.start.col > b.end.col);
};

const checkOverlap = (
  newRect: GridRect,
  existingObjects: StaticObject[],
  existingBeds: Bed[]
): { overlaps: boolean; message: string } => {
  for (const obj of existingObjects) {
    if (rectsOverlap(newRect, obj.rect)) {
      return {
        overlaps: true,
        message: `Объект "${obj.name}" уже занимает эту область`,
      };
    }
  }
  
  for (const bed of existingBeds) {
    const bedRect = {
      start: {
        row: Math.min(...bed.cells.map(c => c.row)),
        col: Math.min(...bed.cells.map(c => c.col)),
      },
      end: {
        row: Math.max(...bed.cells.map(c => c.row)),
        col: Math.max(...bed.cells.map(c => c.col)),
      },
    };
    if (rectsOverlap(newRect, bedRect)) {
      return {
        overlaps: true,
        message: `Грядка "${bed.name}" уже занимает эту область`,
      };
    }
  }
  
  return { overlaps: false, message: '' };
};

export const PlotEditor: React.FC = () => {
  // ===== СОСТОЯНИЕ =====
  const [state, setState] = useState<PlotEditorState>(() => {
    const data = loadPlotData();
    console.log('📦 PlotEditor: загруженные данные:', data);
    return data;
  });
  
  const [mode, setMode] = useState<'view' | 'planting' | 'edit'>('view');
  const [view, setView] = useState<'planting' | 'sun'>('planting');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<GridPosition[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'addBed' | 'addStatic' | 'resize'>('select');
  const [isSelecting, setIsSelecting] = useState(false);

  // Сохранение при изменении
  useEffect(() => {
    savePlotData(state);
  }, [state]);

  // ===== ОБРАБОТЧИКИ =====
  const handleModeChange = (newMode: 'view' | 'planting' | 'edit') => {
    setMode(newMode);
    setSelectedCells([]);
    setSelectedBedId(null);
    setError(null);
    setSelectedTool('select');
    setIsSelecting(false);
  };

  const handleViewChange = (newView: 'planting' | 'sun') => {
    setView(newView);
  };

  const handleToolSelect = (tool: 'select' | 'addBed' | 'addStatic' | 'resize') => {
    setSelectedTool(tool);
    setSelectedCells([]);
    setError(null);
    
    if (tool === 'addBed' || tool === 'addStatic') {
      setIsSelecting(true);
    } else {
      setIsSelecting(false);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (mode === 'planting' && selectedCropId) {
      const bed = state.beds.find(b => 
        b.cells.some(c => c.row === row && c.col === col)
      );
      
      if (bed) {
        const crop = testCrops.find(c => c.id === selectedCropId);
        const newPlanting = {
          cropId: selectedCropId,
          cropName: crop?.name || '',
          plantedDate: new Date().toISOString().split('T')[0],
          cells: [{ row, col }],
          color: crop?.color || '#000000',
        };
        
        const updatedBeds = state.beds.map(b => {
          if (b.id === bed.id) {
            return {
              ...b,
              plantings: [...b.plantings, { ...newPlanting, id: `plant-${Date.now()}` }],
            };
          }
          return b;
        });
        
        setState(prev => ({ ...prev, beds: updatedBeds }));
        setSelectedCropId(null);
        setError(null);
      }
    }
    
    if (mode === 'view') {
      const bed = state.beds.find(b => 
        b.cells.some(c => c.row === row && c.col === col)
      );
      setSelectedBedId(bed?.id || null);
    }
  };

  const handleAddBed = (cells: GridPosition[]) => {
    if (cells.length === 0) return;
    
    const rows = cells.map(c => c.row);
    const cols = cells.map(c => c.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    
    const expectedCells = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        expectedCells.push({ row: r, col: c });
      }
    }
    
    const allCellsPresent = expectedCells.every(ec => 
      cells.some(c => c.row === ec.row && c.col === ec.col)
    );
    
    if (!allCellsPresent) {
      setError('❌ Выделенная область должна быть прямоугольником');
      return;
    }
    
    const bedRect = {
      start: { row: minRow, col: minCol },
      end: { row: maxRow, col: maxCol },
    };
    
    const { overlaps, message } = checkOverlap(bedRect, state.staticObjects, state.beds);
    
    if (overlaps) {
      setError(`❌ ${message}`);
      console.warn('⚠️ Пересечение при создании грядки:', message);
      return;
    }
    
    const newBed = {
      id: `bed-${Date.now()}`,
      name: `Грядка ${state.beds.length + 1}`,
      cells,
      plantings: [],
      createdAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      beds: [...prev.beds, newBed],
    }));
    setError(null);
    setSelectedCells([]);
    setIsSelecting(false);
    setSelectedTool('select');
  };

  const handleAddStaticObject = (rect: GridRect) => {
    const { overlaps, message } = checkOverlap(rect, state.staticObjects, state.beds);
    
    if (overlaps) {
      setError(`❌ ${message}`);
      console.warn('⚠️ Пересечение при создании объекта:', message);
      return;
    }
    
    const name = prompt('Введите название объекта:', 'Новый объект');
    if (!name) return;
    
    const typeOptions = ['building', 'tree', 'path', 'water'];
    const typeMap: Record<string, string> = {
      building: '🏠 Здание',
      tree: '🌳 Дерево',
      path: '🛤️ Дорожка',
      water: '💧 Вода',
    };
    
    const type = prompt(
      `Выберите тип объекта:\n${typeOptions.map((t, i) => `${i + 1}. ${typeMap[t]}`).join('\n')}`,
      '1'
    );
    
    const typeIndex = parseInt(type || '1') - 1;
    const selectedType = typeOptions[typeIndex] || 'building';
    
    const colorMap: Record<string, string> = {
      building: '#8B7355',
      tree: '#2E7D32',
      path: '#D2B48C',
      water: '#4A90D9',
    };
    
    const newObject: StaticObject = {
      id: `static-${Date.now()}`,
      name: name,
      rect: rect,
      color: colorMap[selectedType],
      type: selectedType as StaticObject['type'],
    };
    
    setState(prev => ({
      ...prev,
      staticObjects: [...prev.staticObjects, newObject],
    }));
    setError(null);
    setSelectedCells([]);
    setIsSelecting(false);
    setSelectedTool('select');
  };

  const handleRectSelect = (rect: GridRect) => {
    if (selectedTool === 'addBed') {
      const cells = [];
      for (let r = rect.start.row; r <= rect.end.row; r++) {
        for (let c = rect.start.col; c <= rect.end.col; c++) {
          cells.push({ row: r, col: c });
        }
      }
      handleAddBed(cells);
    } else if (selectedTool === 'addStatic') {
      handleAddStaticObject(rect);
    } else if (selectedTool === 'resize') {
      setState(prev => ({
        ...prev,
        plotSize: rect,
      }));
      setSelectedTool('select');
    }
  };

  // ===== РЕНДЕР =====
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌱 Редактор участка</h1>
        
        <div className={styles.controls}>
          <ModeSwitch mode={mode} onModeChange={handleModeChange} />
          {mode === 'view' && (
            <ViewSwitch view={view} onViewChange={handleViewChange} />
          )}
        </div>
      </header>

      <div className={styles.main}>
        {mode === 'view' && (
          <aside className={styles.historyPanel}>
            <PlantingHistory 
              selectedBedId={selectedBedId}
              beds={state.beds}
            />
          </aside>
        )}

        <main className={styles.canvasWrapper}>
          <GardenCanvas
            plotSize={state.plotSize}
            gridSize={state.gridSize}
            staticObjects={state.staticObjects}
            beds={state.beds}
            viewMode={view}
            mode={mode}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
            onRectSelect={handleRectSelect}
            onBedSelect={setSelectedBedId}
            selectionMode={selectedTool === 'addBed' || selectedTool === 'addStatic'}
          />
        </main>

        {mode === 'planting' && (
          <aside className={styles.plantingPanel}>
            <h3>Выберите культуру</h3>
            <div className={styles.cropList}>
              {testCrops.map(crop => (
                <button
                  key={crop.id}
                  className={selectedCropId === crop.id ? styles.selected : ''}
                  onClick={() => setSelectedCropId(crop.id)}
                  style={{ borderColor: crop.color }}
                >
                  <span style={{ color: crop.color }}>●</span>
                  {crop.name}
                </button>
              ))}
            </div>
            {selectedCropId && (
              <p>Кликните на клетку для посадки</p>
            )}
          </aside>
        )}
      </div>

      {error && (
        <div className={styles.errorToast}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {mode === 'edit' && (
        <footer className={styles.footer}>
          <Toolbar 
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            onAddStaticObject={handleAddStaticObject}
            onAddBed={handleAddBed}
            onUpdatePlotSize={(rect) => {
              setState(prev => ({ ...prev, plotSize: rect }));
            }}
            isSelecting={isSelecting}
          />
        </footer>
      )}
    </div>
  );
};

export default PlotEditor;