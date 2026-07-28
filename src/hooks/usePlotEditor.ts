import { useCallback, useEffect, useState } from "react";
import type {
  GardenObject,
  Rect,
  Subtype,
  Tool,
  UIBed,
  UICrop,
  UIPlanting,
  UIStaticObject,
} from "../api";
import { STATIC_COLORS, STATIC_LABELS, getCrops, getPlotStructure, sendPlotEvents } from "../api";
import { useToast } from "../components/common/Toast";
import {
  adaptBed,
  adaptObject,
  createBedCreatedEvent,
  createBedDeletedEvent,
  createBedUpdatedEvent,
  createCropPlantedEvent,
  createCropRemovedEvent,
  createObjectCreatedEvent,
  createObjectDeletedEvent,
  createObjectUpdatedEvent,
} from "../pages/utils/adapters"; // ✅ Убрали hasObjectChanged

interface UsePlotEditorProps {
  plotId?: string;
}

// Цвета для культур (для UI, если API не возвращает цвета)
const CROP_COLORS = [
  "#EF4444",
  "#22C55E",
  "#F59E0B",
  "#EAB308",
  "#A855F7",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F472B6",
];

// Type guard для проверки типа объекта
const isBed = (obj: GardenObject): obj is UIBed => {
  return obj.type === "bed";
};

export const usePlotEditor = ({ plotId }: UsePlotEditorProps = {}) => {
  const { showToast } = useToast();

  // ===== ОСНОВНЫЕ СОСТОЯНИЯ =====
  const [objects, setObjects] = useState<GardenObject[]>([]);
  const [selectedElement, setSelectedElement] = useState<GardenObject | null>(null);
  const [crops, setCrops] = useState<UICrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const refreshHistory = () => setRefreshTrigger((p) => !p);

  // ===== ДАННЫЕ УЧАСТКА ИЗ БД =====
  const [plotName, setPlotName] = useState<string>("");
  const [plotWidth, setPlotWidth] = useState<number>(10);
  const [plotHeight, setPlotHeight] = useState<number>(10);
  const [gridCols, setGridCols] = useState<number>(20);
  const [gridRows, setGridRows] = useState<number>(20);
  const [cellSize, setCellSize] = useState<number>(0.5);

  // ===== СОСТОЯНИЯ РЕДАКТОРА =====
  const [scale, setScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState<Tool>("view");
  const [selectedSubtype, setSelectedSubtype] = useState<Subtype>("building");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlotInfoCollapsed, setIsPlotInfoCollapsed] = useState(false);
  const [pendingBedRect, setPendingBedRect] = useState<Rect | null>(null);

  // ===== СОСТОЯНИЯ РИСОВАНИЯ =====
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCell, setStartCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [endCell, setEndCell] = useState<{ row: number; col: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredObject, setHoveredObject] = useState<GardenObject | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    object: GardenObject;
  } | null>(null);
  const [plantingModal, setPlantingModal] = useState<{
    bed: UIBed;
    cropId: number;
    plantedDate: Date;
  } | null>(null);

  // ===== ВСПОМОГАТЕЛЬНЫЕ ВЫЧИСЛЕНИЯ =====
  const cellSizeMeters = 0.5 as const;
  const cols = gridCols;
  const rows = gridRows;

  const beds = objects.filter(isBed) as UIBed[];
  const staticObjects = objects.filter((obj): obj is UIStaticObject => obj.type === "static");

  const bedsCount = beds.length;

  // ===== ЗАГРУЗКА КУЛЬТУР (вынесена наверх) =====
  const loadCrops = useCallback(async () => {
    try {
      const apiCrops = await getCrops();
      const uiCrops: UICrop[] = apiCrops.map((crop, index) => ({
        id: crop.id,
        name: crop.name,
        vegetationDays: crop.vegetation_days_avg,
        color: CROP_COLORS[index % CROP_COLORS.length],
      }));
      setCrops(uiCrops);
      return uiCrops;
    } catch (err) {
      showToast("Ошибка загрузки культур", "error");
      console.error(err);
      return [];
    }
  }, [showToast]);

  // ===== ЗАГРУЗКА ДАННЫХ =====
  const loadPlotData = useCallback(async () => {
    if (!plotId) return;

    setLoading(true);
    setError(null);

    try {
      // Загружаем структуру участка
      const structure = await getPlotStructure(plotId);

      // Загружаем культуры (если еще не загружены)
      let cropsData = crops;
      if (cropsData.length === 0) {
        cropsData = await loadCrops();
      }

      if (structure.plot) {
        setPlotName(structure.plot.name);
        setPlotWidth(structure.plot.grid_cols * structure.plot.grid_cell_size);
        setPlotHeight(structure.plot.grid_rows * structure.plot.grid_cell_size);
        setGridCols(structure.plot.grid_cols);
        setGridRows(structure.plot.grid_rows);
        setCellSize(structure.plot.grid_cell_size);
      }

      // Преобразуем грядки, подставляя названия культур по ID
      const uiObjects: GardenObject[] = [
        ...structure.beds.map((bed) => {
          let cropName = null;
          // Находим название культуры по ID
          if (bed.current_crop_id && cropsData.length > 0) {
            const crop = cropsData.find((c) => c.id === bed.current_crop_id);
            cropName = crop?.name || null;
          }
          const adaptedBed = adaptBed(bed, []);
          return {
            ...adaptedBed,
            currentCropName: cropName,
            plantDate: bed.plant_date || null,
          } as UIBed;
        }),
        ...structure.objects.map((obj) => adaptObject(obj)),
      ];
      setObjects(uiObjects);
      setIsInitialized(true);
    } catch (err) {
      showToast("Ошибка загрузки данных участка", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [plotId, crops, loadCrops, showToast]);

  useEffect(() => {
    if (plotId && !isInitialized) {
      loadPlotData();
    }
  }, [plotId, isInitialized, loadPlotData]);

  // ===== ОБНОВЛЕНИЕ ДАННЫХ БЕЗ МЕРЦАНИЯ =====
  const refreshData = useCallback(async () => {
    if (!plotId) return;

    try {
      const structure = await getPlotStructure(plotId);

      const selectedId = selectedElement?.id;

      if (structure.plot) {
        setPlotName(structure.plot.name);
        setPlotWidth(structure.plot.grid_cols * structure.plot.grid_cell_size);
        setPlotHeight(structure.plot.grid_rows * structure.plot.grid_cell_size);
        setGridCols(structure.plot.grid_cols);
        setGridRows(structure.plot.grid_rows);
        setCellSize(structure.plot.grid_cell_size);
      }

      const uiObjects: GardenObject[] = [
        ...structure.beds.map((bed) => {
          let cropName = null;
          if (bed.current_crop_id && crops.length > 0) {
            const crop = crops.find((c) => c.id === bed.current_crop_id);
            cropName = crop?.name || null;
          }
          const adaptedBed = adaptBed(bed, []);
          return {
            ...adaptedBed,
            currentCropName: cropName,
            plantDate: bed.plant_date || null,
          } as UIBed;
        }),
        ...structure.objects.map((obj) => adaptObject(obj)),
      ];
      setObjects(uiObjects);

      // Восстанавливаем выделение
      if (selectedId) {
        const restored = uiObjects.find((obj) => obj.id === selectedId);
        if (restored) {
          setSelectedElement(restored);
        } else {
          setSelectedElement(null);
        }
      }
    } catch (err) {
      console.error("Ошибка обновления данных:", err);
    }
  }, [plotId, selectedElement?.id, crops]);

  // ===== ФУНКЦИЯ ОТПРАВКИ СОБЫТИЯ =====
  const sendEvent = useCallback(
    async (event: any) => {
      if (!plotId) return;
      if (isSaving) return;

      setIsSaving(true);
      try {
        console.log(`📤 Отправка события:`, event);
        await sendPlotEvents(plotId, { events: [event] });
        console.log(`✅ Событие успешно отправлено`);
        showToast("Изменения сохранены", "success");
        await refreshData();
      } catch (err: any) {
        console.error(`❌ Ошибка отправки события:`, err);
        if (err.response?.status === 409) {
          showToast("Конфликт версий. Данные обновлены", "warning");
          await refreshData();
        } else {
          const message = err.response?.data?.error || "Ошибка отправки события";
          showToast(message, "error");
        }
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [plotId, isSaving, refreshData, showToast],
  );

  // ===== ОСНОВНЫЕ ФУНКЦИИ =====

  const addObject = useCallback(
    async (obj: GardenObject) => {
      let event;
      if (obj.type === "bed") {
        event = createBedCreatedEvent(obj as UIBed);
      } else {
        event = createObjectCreatedEvent(obj as UIStaticObject);
      }
      await sendEvent(event);
    },
    [sendEvent],
  );

  const updateObject = useCallback(
    async (id: string, updates: Partial<GardenObject>) => {
      const prevObj = objects.find((obj) => obj.id === id);
      if (!prevObj) return;

      const updatedObj = { ...prevObj, ...updates } as GardenObject;

      let event;
      if (updatedObj.type === "bed") {
        event = createBedUpdatedEvent(updatedObj as UIBed, prevObj as UIBed);
      } else {
        event = createObjectUpdatedEvent(updatedObj as UIStaticObject, prevObj as UIStaticObject);
      }
      if (event) {
        await sendEvent(event);
      }
    },
    [objects, sendEvent],
  );

  const deleteObject = useCallback(
    async (id: string) => {
      const obj = objects.find((o) => o.id === id);
      if (!obj) return;

      let event;
      if (obj.type === "bed") {
        event = createBedDeletedEvent(id);
      } else {
        event = createObjectDeletedEvent(id);
      }
      await sendEvent(event);
    },
    [objects, sendEvent],
  );

  const addPlanting = useCallback(
    async (bedId: string, planting: Omit<UIPlanting, "id">) => {
      const event = createCropPlantedEvent(bedId, planting.cropId, planting.plantedDate);
      await sendEvent(event);
    },
    [sendEvent],
  );

  const harvestPlanting = useCallback(
    async (bedId: string) => {
      const event = createCropRemovedEvent(bedId, true);

      await sendEvent(event);

      refreshHistory();

      showToast("Урожай успешно собран!", "success");
    },
    [sendEvent, showToast],
  );

  const createBed = useCallback(
    (rect: Rect, name: string): UIBed => {
      return {
        id: `bed-${Date.now()}`,
        type: "bed",
        name: name || `Грядка ${beds.length + 1}`,
        color: "#22c55e",
        ...rect,
        plantings: [],
        createdAt: new Date().toISOString(),
      };
    },
    [beds.length],
  );

  const createStaticObject = useCallback((rect: Rect, subtype: Subtype): UIStaticObject => {
    return {
      id: `static-${Date.now()}`,
      type: "static",
      subtype,
      name: STATIC_LABELS[subtype],
      color: STATIC_COLORS[subtype],
      ...rect,
    };
  }, []);

  const resetDrawing = useCallback(() => {
    setIsDrawing(false);
    setStartCell(null);
    setEndCell(null);
    setIsDragging(false);
    setSelectedElement(null);
  }, []);

  const handleToolSelect = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    if (!["view", "plant"].includes(tool)) {
      setSelectedElement(null);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const togglePlotInfo = useCallback(() => {
    setIsPlotInfoCollapsed((prev) => !prev);
  }, []);

  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    setIsMenuOpen(isOpen);
  }, []);

  const handleBedClick = useCallback(
    (row: number, col: number) => {
      const bed = objects.find(
        (obj): obj is UIBed =>
          obj.type === "bed" &&
          row >= obj.row &&
          row < obj.row + obj.height &&
          col >= obj.col &&
          col < obj.col + obj.width,
      );

      if (bed) {
        setSelectedElement(bed);
        setIsPlotInfoCollapsed(true);
      } else {
        setSelectedElement(null);
      }
    },
    [objects],
  );

  const handlePlant = useCallback(() => {
    if (selectedElement && selectedElement.type === "bed" && crops.length > 0) {
      setPlantingModal({
        bed: selectedElement,
        cropId: crops[0].id,
        plantedDate: new Date(),
      });
    } else if (!crops.length) {
      showToast("Сначала загрузите список культур", "warning");
    } else {
      showToast("Выберите грядку для посадки", "info");
    }
  }, [selectedElement, crops, showToast]);

  const handlePlantingSave = useCallback(
    async (cropId: number, plantedDate: string) => {
      if (plantingModal) {
        const crop = crops.find((c) => c.id === cropId);
        if (crop) {
          await addPlanting(plantingModal.bed.id, {
            cropId,
            cropName: crop.name,
            plantedDate,
            cells: [],
            color: crop.color,
          });
        }
        setPlantingModal(null);
      }
    },
    [plantingModal, crops, addPlanting],
  );

  const handleAddBed = useCallback(
    async (name: string, rect: Rect) => {
      const newBed = createBed(rect, name);
      await addObject(newBed);
      setPendingBedRect(null);
    },
    [createBed, addObject],
  );

  const handlePendingBedRectClear = useCallback(() => {
    setPendingBedRect(null);
  }, []);

  const handleRenameObject = useCallback(
    async (id: string, newName: string) => {
      await updateObject(id, { name: newName });
    },
    [updateObject],
  );

  const handleObjectUpdate = useCallback(
    async (obj: GardenObject) => {
      await updateObject(obj.id, obj);
    },
    [updateObject],
  );

  const handleClearAll = useCallback(async () => {
    if (objects.length === 0) {
      showToast("Нет объектов для удаления", "info");
      return;
    }

    const objectsToDelete = [...objects];

    try {
      const events: any[] = [];

      for (const obj of objectsToDelete) {
        let event;
        if (obj.type === "bed") {
          event = createBedDeletedEvent(obj.id);
        } else {
          event = createObjectDeletedEvent(obj.id);
        }
        events.push(event);
      }

      if (events.length > 0 && plotId) {
        await sendPlotEvents(plotId, { events });
        showToast(`Удалено ${events.length} объектов`, "success");
      }

      setObjects([]);
      setSelectedElement(null);
    } catch (err: any) {
      console.error("❌ Ошибка удаления объектов:", err);
      const message = err.response?.data?.error || "Ошибка удаления объектов";
      showToast(message, "error");
      await refreshData();
    }
  }, [objects, plotId, refreshData, showToast]);

  const handleRectSelect = useCallback(
    (rect: Rect) => {
      if (selectedTool === "addBed") {
        setPendingBedRect(rect);
      } else if (selectedTool === "addStatic") {
        const newObject = createStaticObject(rect, selectedSubtype);
        addObject(newObject);
      }
    },
    [selectedTool, selectedSubtype, createStaticObject, addObject],
  );

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.3, prev - 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
  }, []);

  const handleScaleChange = useCallback((value: number) => {
    setScale(Math.max(0.3, Math.min(3, value)));
  }, []);

  // ===== ЭКСПОРТ =====
  return {
    objects,
    setObjects,
    selectedElement,
    setSelectedElement,
    crops,
    loading,
    error,
    isSaving,
    plotId,
    plotName,
    plotWidth,
    plotHeight,
    gridCols,
    gridRows,
    cellSize,
    cellSizeMeters,
    cols,
    rows,
    scale,
    setScale,
    selectedTool,
    setSelectedTool,
    selectedSubtype,
    setSelectedSubtype,
    isMenuOpen,
    setIsMenuOpen,
    isPlotInfoCollapsed,
    setIsPlotInfoCollapsed,
    pendingBedRect,
    setPendingBedRect,
    isDrawing,
    setIsDrawing,
    startCell,
    setStartCell,
    endCell,
    setEndCell,
    isDragging,
    setIsDragging,
    hoveredObject,
    setHoveredObject,
    contextMenu,
    setContextMenu,
    plantingModal,
    setPlantingModal,
    beds,
    staticObjects,
    bedsCount,
    loadPlotData,
    loadCrops,
    addObject,
    updateObject,
    deleteObject,
    addPlanting,
    harvestPlanting,
    createBed,
    createStaticObject,
    refreshData,
    resetDrawing,
    handleToolSelect,
    handleClosePanel,
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
    handleZoomReset,
    handleScaleChange,
    refreshTrigger,
  };
};

export default usePlotEditor;
