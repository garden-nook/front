import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UIBed } from "../api/types/plot.types";
import { useToast } from "../components/common/Toast";
import BedInfo from "../components/plot/BedInfo";
import GardenCanvas from "../components/plot/GardenCanvas";
import AddBedModal from "../components/plot/modals/AddBedModal";
import ContextMenu from "../components/plot/modals/ContextMenu";
import PlantingHistory from "../components/plot/PlantingHistory";
import PlotInfo from "../components/plot/PlotInfo";
import Toolbar from "../components/plot/Toolbar";
import ZoomControls from "../components/plot/ZoomControls";
import { usePlotEditor } from "../hooks/usePlotEditor";
import styles from "./PlotEditor.module.css";
import RecommendationModal from "../components/plot/modals/RecommendationModal";
import { getRecommendations } from "../api";

export const PlotEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id: plotId } = useParams<{ id: string }>();
  const { showToast } = useToast();

  // Состояние для модалки добавления грядки
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [defaultBedName, setDefaultBedName] = useState("");

  const {
    objects,
    selectedObject,
    setSelectedObject,
    selectedBed,
    setSelectedBed,
    deleteObject,
    harvestPlanting,
    plotName,
    plotWidth,
    plotHeight,
    cellSizeMeters,
    cols,
    rows,
    scale,
    setScale,
    selectedTool,
    selectedSubtype,
    setSelectedSubtype,
    isMenuOpen,
    isPlotInfoCollapsed,
    pendingBedRect,
    isDrawing,
    setIsDrawing,
    startCell,
    setStartCell,
    endCell,
    setEndCell,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    hoveredObject,
    setHoveredObject,
    contextMenu,
    setContextMenu,
    plantingModal,
    setPlantingModal,
    bedsForHistory,
    bedsCount,
    loading,
    isSaving,
    resetDrawing,
    handleToolSelect,
    togglePlotInfo,
    handleMenuOpenChange,
    handleBedClick,
    handlePlant,
    handlePlantingSave,
    handleAddBed,
    handlePendingBedRectClear,
    handleRenameObject,
    handleObjectUpdate,
    handleClearAll,
    handleRectSelect,
    handleZoomIn,
    handleZoomOut,
    handleScaleChange,
  } = usePlotEditor({
    plotId,
  });

  const handleGoToPlots = () => {
    navigate("/plots");
  };

  // Обработчик сбора урожая
  const handleHarvest = () => {
    if (selectedBed) {
      const hasActivePlanting =
        selectedBed.currentCropId !== null && selectedBed.currentCropId !== undefined;

      if (hasActivePlanting) {
        const plantingId = `current-${selectedBed.id}`;
        harvestPlanting(selectedBed.id, plantingId);
      } else {
        showToast("Нет активных посадок для сбора", "info");
      }
    }
  };

  // Обработчики для модалки добавления грядки
  const handleAddBedModalOpen = (defaultName: string) => {
    setDefaultBedName(defaultName);
    setShowAddBedModal(true);
  };

  const handleAddBedModalSave = (name: string) => {
    if (pendingBedRect) {
      handleAddBed(name, pendingBedRect);
      handlePendingBedRectClear();
    }
    setShowAddBedModal(false);
  };

  const handleAddBedModalClose = () => {
    setShowAddBedModal(false);
    handlePendingBedRectClear();
  };

  // Открываем модалку при появлении pendingBedRect
  useEffect(() => {
    if (pendingBedRect) {
      const bedCount = objects.filter((o) => o.type === "bed").length || 0;
      setDefaultBedName(`Грядка ${bedCount + 1}`);
      setShowAddBedModal(true);
    }
  }, [pendingBedRect, objects]);

  // Обновляем selectedBed при изменении объектов
  useEffect(() => {
    if (selectedBed?.id) {
      const updated = objects.find(
        (obj): obj is UIBed => obj.type === "bed" && obj.id === selectedBed.id,
      );
      setSelectedBed(updated || null);
    }
  }, [objects, selectedBed?.id, setSelectedBed]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка данных участка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbarWrapper}>
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          selectedSubtype={selectedSubtype}
          onSubtypeSelect={setSelectedSubtype}
          selectedObject={selectedObject}
          onClearAll={handleClearAll}
          onAddBed={handleAddBedModalOpen}
          pendingBedRect={pendingBedRect}
          onPendingBedRectClear={handlePendingBedRectClear}
          onMenuOpenChange={handleMenuOpenChange}
          isDrawing={isDrawing}
        />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <PlotInfo
            plotName={plotName}
            plotWidth={plotWidth}
            plotHeight={plotHeight}
            cellSizeMeters={cellSizeMeters}
            cols={cols}
            rows={rows}
            objectsCount={objects.length}
            bedsCount={bedsCount}
            isCollapsed={isPlotInfoCollapsed}
            onToggle={togglePlotInfo}
          />

          {selectedBed && (
            <BedInfo
              bed={selectedBed}
              showPlantButton={selectedTool === "view" || selectedTool === "plant"}
              onPlant={handlePlant}
              onHarvest={handleHarvest}
            />
          )}

          {selectedBed && <PlantingHistory selectedBedId={selectedBed.id} beds={bedsForHistory} />}
        </div>

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
            onRectSelect={handleRectSelect}
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

          <button
            className={styles.backToListBtn}
            onClick={handleGoToPlots}
            title="Вернуться к списку участков"
          >
            Вернуться к списку участков
          </button>

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

      {/* Модалки - в корне, вне toolbarWrapper */}
      <AddBedModal
        open={showAddBedModal}
        onSave={handleAddBedModalSave}
        onClose={handleAddBedModalClose}
        defaultName={defaultBedName}
      />

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

      {plantingModal && (
        <RecommendationModal 
          bed={plantingModal.bed} 
          initialPlantingDate={plantingModal.plantedDate} 
          fetchCultures={getRecommendations}
          onPlant={handlePlantingSave}
          onClose={() => setPlantingModal(null)}
          />
      )}

      {/* Индикатор сохранения */}
      {isSaving && <div className={styles.savingIndicator}>Сохранение...</div>}
    </div>
  );
};

export default PlotEditor;
