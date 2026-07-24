// src/pages/PlotEditor/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlotEditor.module.css';
import { usePlotEditor } from '../hooks/usePlotEditor';
import type { Tool, Subtype, GardenObject, Bed, Rect } from '../api/types/plot.types';
import Toolbar from '../components/plot/Toolbar';
import GardenCanvas from '../components/plot/GardenCanvas';
import ContextMenu from '../components/plot/modals/ContextMenu';
import PlantingModal from '../components/plot/modals/PlantingModal';
import ZoomControls from '../components/plot/ZoomControls';
import PlantingHistory from '../components/plot/PlantingHistory';

export const PlotEditor: React.FC = () => {
  const navigate = useNavigate();
  
  const {
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
  } = usePlotEditor();

  const [plotWidth, setPlotWidth] = useState(10);
  const [plotHeight, setPlotHeight] = useState(10);
  const [scale, setScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState<Tool>('view'); // По умолчанию view
  const [selectedSubtype, setSelectedSubtype] = useState<Subtype>('building');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; object: GardenObject } | null>(null);
  const [plantingModal, setPlantingModal] = useState<{ bed: Bed; cropId: string; plantedDate: string } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [endCell, setEndCell] = useState<{ row: number; col: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ row: number; col: number } | null>(null);
  const [hoveredObject, setHoveredObject] = useState<GardenObject | null>(null);
  const [isPlotInfoCollapsed, setIsPlotInfoCollapsed] = useState(false);
  const [pendingBedRect, setPendingBedRect] = useState<Rect | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Конвертируем GardenObject в Bed для PlantingHistory
  const bedsForHistory = objects
    .filter(obj => obj.type === 'bed')
    .map(obj => {
      const bed = obj as Bed;
      return {
        id: bed.id,
        name: bed.name,
        cells: [], // Заполняем из данных грядки
        plantings: bed.plantings || [],
        createdAt: bed.createdAt || new Date().toISOString(),
      };
    });

  const cellSizeMeters = 0.5;
  const cols = Math.round(plotWidth / cellSizeMeters);
  const rows = Math.round(plotHeight / cellSizeMeters);

  const resetDrawing = useCallback(() => {
    setIsDrawing(false);
    setStartCell(null);
    setEndCell(null);
    setIsDragging(false);
    setSelectedObject(null);
    setDragOffset(null);
  }, [setSelectedObject]);

  const handleClearAll = useCallback(() => {
    if (confirm('Удалить все объекты?')) {
      setObjects([]);
      setSelectedObject(null);
      setSelectedBed(null);
    }
  }, [setObjects, setSelectedObject, setSelectedBed]);

  useEffect(() => {
    if (selectedBed) {
      const updated = objects.find(obj => obj.id === selectedBed.id) as Bed | undefined;
      setSelectedBed(updated || null);
    }
  }, [objects, selectedBed?.id, setSelectedBed]);

  const handleObjectUpdate = useCallback((obj: GardenObject) => {
    updateObject(obj.id, obj);
  }, [updateObject]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(3, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(0.3, prev - 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
  }, []);

  const handleScaleChange = useCallback((value: number) => {
    setScale(Math.max(0.3, Math.min(3, value)));
  }, []);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    // При переключении на другой инструмент закрываем информацию о грядке
    if (tool !== 'view' && tool !== 'plant') {
      setSelectedBed(null);
    }
  };

  const handleClosePanel = useCallback(() => {
    setSelectedBed(null);
    setSelectedObject(null);
  }, [setSelectedBed, setSelectedObject]);

  const togglePlotInfo = useCallback(() => {
    setIsPlotInfoCollapsed(prev => !prev);
  }, []);

  const handleGoToPlots = useCallback(() => {
    navigate('/plots');
  }, [navigate]);

  const handleRenameObject = useCallback((id: string, newName: string) => {
    updateObject(id, { name: newName });
  }, [updateObject]);

  const handleAddBed = useCallback((name: string, rect: Rect) => {
    const newBed = createBed(rect, name);
    addObject(newBed);
    setPendingBedRect(null);
  }, [createBed, addObject]);

  const handlePendingBedRectClear = useCallback(() => {
    setPendingBedRect(null);
  }, []);

  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    setIsMenuOpen(isOpen);
  }, []);

  // Обработчик клика по грядке
  const handleBedClick = useCallback((row: number, col: number) => {
    const bed = objects.find(o => 
      o.type === 'bed' &&
      row >= o.row && row < o.row + o.height &&
      col >= o.col && col < o.col + o.width
    ) as Bed | undefined;
    
    if (bed) {
      setSelectedBed(bed);
      setIsPlotInfoCollapsed(true);
    } else {
      setSelectedBed(null);
    }
  }, [objects, setSelectedBed]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbarWrapper}>
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          selectedSubtype={selectedSubtype}
          onSubtypeSelect={setSelectedSubtype}
          selectedObject={selectedObject}
          onClearAll={handleClearAll}
          onAddBed={handleAddBed}
          pendingBedRect={pendingBedRect}
          onPendingBedRectClear={handlePendingBedRectClear}
          onMenuOpenChange={handleMenuOpenChange}
          isDrawing={isDrawing}
        />
      </div>

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <div className={styles.mainContent}>
        {/* Левая панель с информацией */}
        <div className={styles.leftPanel}>
          {/* Информация об участке */}
          <div className={styles.plotInfoWrapper}>
            <div 
              className={`${styles.plotInfo} ${isPlotInfoCollapsed ? styles.collapsed : ''}`}
              onClick={isPlotInfoCollapsed ? togglePlotInfo : undefined}
            >
              {isPlotInfoCollapsed ? (
                <div className={styles.plotInfoCollapsed}>
                  <span className={styles.plotInfoTitle}>🌱 Участок</span>
                  <button 
                    className={styles.plotInfoExpandBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlotInfo();
                    }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.plotInfoHeader}>
                    <span className={styles.plotInfoTitle}>🌱 Информация об участке</span>
                    <button 
                      className={styles.plotInfoCollapseBtn}
                      onClick={togglePlotInfo}
                      title="Свернуть"
                    >
                      −
                    </button>
                  </div>
                  <div className={styles.plotInfoContent}>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Размер:</span>
                      <span className={styles.plotInfoValue}>{plotWidth} × {plotHeight} м</span>
                    </div>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Площадь:</span>
                      <span className={styles.plotInfoValue}>{(plotWidth * plotHeight).toFixed(1)} м²</span>
                    </div>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Клетка:</span>
                      <span className={styles.plotInfoValue}>{cellSizeMeters} м</span>
                    </div>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Сетка:</span>
                      <span className={styles.plotInfoValue}>{cols} × {rows}</span>
                    </div>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Объектов:</span>
                      <span className={styles.plotInfoValue}>{objects.length}</span>
                    </div>
                    <div className={styles.plotInfoRow}>
                      <span className={styles.plotInfoLabel}>Грядок:</span>
                      <span className={styles.plotInfoValue}>
                        {objects.filter(o => o.type === 'bed').length}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Информация о грядке (появляется при выборе в любом режиме) */}
          {selectedBed && (
            <div className={styles.bedInfoWrapper}>
              <div className={styles.bedInfo}>
                <div className={styles.bedInfoHeader}>
                  <span className={styles.bedInfoTitle}>🌿 {selectedBed.name}</span>
                  <button 
                    className={styles.bedInfoCloseBtn}
                    onClick={handleClosePanel}
                    title="Закрыть"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.bedInfoContent}>
                  <div className={styles.bedInfoRow}>
                    <span className={styles.bedInfoLabel}>Размер:</span>
                    <span className={styles.bedInfoValue}>{selectedBed.width} × {selectedBed.height}</span>
                  </div>
                  <div className={styles.bedInfoRow}>
                    <span className={styles.bedInfoLabel}>Посадок:</span>
                    <span className={styles.bedInfoValue}>{selectedBed.plantings?.length || 0}</span>
                  </div>
                  <div className={styles.bedInfoRow}>
                    <span className={styles.bedInfoLabel}>Цвет:</span>
                    <span 
                      className={styles.bedInfoColor} 
                      style={{ backgroundColor: selectedBed.color }}
                    />
                  </div>
                  {/* Кнопка "Посадить" только в режиме посадки */}
                  {(selectedTool === 'view' || selectedTool === 'plant') && (
                    <button
                      className={styles.plantBtn}
                      onClick={() => {
                        if (selectedBed) {
                          setPlantingModal({
                            bed: selectedBed,
                            cropId: CROPS[0].id,
                            plantedDate: new Date().toISOString().split('T')[0],
                          });
                        }
                      }}
                    >
                      🌱 Посадить
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* История посадок (появляется при выборе грядки) */}
          {selectedBed && (
            <div className={styles.historyWrapper}>
              <PlantingHistory
                selectedBedId={selectedBed.id}
                beds={bedsForHistory}
              />
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <GardenCanvas
            plotSize={{ start: { row: 0, col: 0 }, end: { row: rows - 1, col: cols - 1 } }}
            gridSize={cellSizeMeters}
            objects={objects}
            selectedTool={selectedTool}
            selectedObject={selectedObject}
            hoveredObject={hoveredObject}
            isDrawing={isDrawing}
            startCell={startCell}
            endCell={endCell}
            isDragging={isDragging}
            dragOffset={dragOffset}
            scale={scale}
            cols={cols}
            rows={rows}
            setScale={setScale}
            isMenuOpen={isMenuOpen}
            onCellClick={handleBedClick}
            onRectSelect={(rect) => {
              if (selectedTool === 'addBed') {
                setPendingBedRect(rect);
              } else if (selectedTool === 'addStatic') {
                const newObject = createStaticObject(rect, selectedSubtype);
                addObject(newObject);
              }
            }}
            onObjectSelect={setSelectedObject}
            onObjectDelete={deleteObject}
            onContextMenu={setContextMenu}
            onHoverObject={setHoveredObject}
            resetDrawing={resetDrawing}
            setStartCell={setStartCell}
            setEndCell={setEndCell}
            setIsDrawing={setIsDrawing}
            setIsDragging={setIsDragging}
            setDragOffset={setDragOffset}
            onObjectUpdate={handleObjectUpdate}
          />

          {/* Кнопка "Вернуться к списку участков" — слева снизу */}
          <button 
            className={styles.backToListBtn}
            onClick={handleGoToPlots}
            title="Вернуться к списку участков"
          >
            Вернуться к списку участков
          </button>

          {/* Масштаб — справа снизу */}
          <div className={styles.zoomControlsWrapper}>
            <ZoomControls
              scale={scale}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onScaleChange={handleScaleChange}
              minScale={0.3}
              maxScale={3}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          object={contextMenu.object}
          onDelete={(id) => {
            deleteObject(id);
            setContextMenu(null);
          }}
          onRename={handleRenameObject}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Модалка посадки */}
      {plantingModal && (
        <PlantingModal
          bed={plantingModal.bed}
          cropId={plantingModal.cropId}
          plantedDate={plantingModal.plantedDate}
          crops={CROPS}
          onSave={(cropId, plantedDate) => {
            const crop = CROPS.find(c => c.id === cropId);
            if (crop) {
              addPlanting(plantingModal.bed.id, {
                cropId,
                cropName: crop.name,
                plantedDate,
                cells: [],
                color: crop.color,
              });
            }
            setPlantingModal(null);
          }}
          onClose={() => setPlantingModal(null)}
        />
      )}
    </div>
  );
};

export default PlotEditor;