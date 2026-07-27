// src/pages/PlotEditor/utils/adapters.ts
import type {
  UIBed,
  UIStaticObject,
  GardenObject,
  PlotEvent,
  BedCreatedPayload,
  BedUpdatedPayload,
  BedDeletedPayload,
  ObjectCreatedPayload,
  ObjectUpdatedPayload,
  ObjectDeletedPayload,
  CropPlantedPayload,
  CropRemovedPayload,
  UICrop,
} from "../../api/types/plot.types";
import type { Crop } from "../../api/types/crops.types";
import {
  EventType as EventTypeConst,
  STATIC_COLORS,
} from "../../api/types/plot.types";

// Маппинг типов объектов из API в UI
const OBJECT_TYPE_MAP: Record<number, string> = {
  1: "building",
  2: "tree",
  3: "path",
  4: "water",
};

// Обратный маппинг для создания событий
const OBJECT_TYPE_REVERSE_MAP: Record<string, number> = {
  building: 1,
  tree: 2,
  path: 3,
  water: 4,
};

// Цвета для культур
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

// ===== АДАПТЕРЫ ДЛЯ API -> UI =====

// Преобразование API грядки в UI грядку
export const adaptBed = (bed: any, plantings: any[] = []): UIBed => {
  return {
    id: bed.bed_id,
    type: "bed",
    name: bed.name,
    row: bed.y_start,
    col: bed.x_start,
    width: bed.width,
    height: bed.height,
    color: "#22c55e",
    plantings: plantings || [],
    createdAt: new Date().toISOString(),
    currentCropId: bed.current_crop_id || null,
    currentCropName: bed.current_crop_name || null, // Если бэк возвращает
    plantDate: bed.plant_date || null,
  };
};

// Преобразование API объекта в UI объект
export const adaptObject = (obj: any): UIStaticObject => {
  const subtype = OBJECT_TYPE_MAP[obj.object_type] || "building";
  return {
    id: obj.object_id,
    type: "static",
    name: obj.name,
    color: STATIC_COLORS[subtype as keyof typeof STATIC_COLORS] || "#8B7355", // ✅ Используем STATIC_COLORS
    subtype: subtype as any,
    row: obj.y_start,
    col: obj.x_start,
    width: obj.width,
    height: obj.height,
  };
};

// Преобразование API культуры в UI культуру
export const adaptCrop = (crop: Crop, index?: number): UICrop => {
  const colorIndex =
    index !== undefined
      ? index % CROP_COLORS.length
      : crop.id % CROP_COLORS.length;
  return {
    id: crop.id,
    name: crop.name,
    vegetationDays: crop.vegetation_days_avg,
    color: CROP_COLORS[colorIndex],
  };
};

// ===== СОЗДАНИЕ СОБЫТИЙ =====

// Создание грядки
export const createBedCreatedEvent = (bed: UIBed): PlotEvent => {
  return {
    type: EventTypeConst.BedCreated,
    payload: {
      name: bed.name,
      x_start: bed.col,
      y_start: bed.row,
      width: bed.width,
      height: bed.height,
    } as BedCreatedPayload,
  };
};

// Обновление грядки
export const createBedUpdatedEvent = (
  bed: UIBed,
  previousBed?: UIBed,
): PlotEvent => {
  const payload: BedUpdatedPayload = {
    bed_id: bed.id,
  };

  if (previousBed) {
    if (bed.name !== previousBed.name) payload.name = bed.name;
    if (bed.col !== previousBed.col) payload.x_start = bed.col;
    if (bed.row !== previousBed.row) payload.y_start = bed.row;
    if (bed.width !== previousBed.width) payload.width = bed.width;
    if (bed.height !== previousBed.height) payload.height = bed.height;
  } else {
    payload.name = bed.name;
    payload.x_start = bed.col;
    payload.y_start = bed.row;
    payload.width = bed.width;
    payload.height = bed.height;
  }

  return {
    type: EventTypeConst.BedUpdated,
    payload,
  };
};

// Удаление грядки
export const createBedDeletedEvent = (bedId: string): PlotEvent => {
  return {
    type: EventTypeConst.BedDeleted,
    payload: {
      bed_id: bedId,
    } as BedDeletedPayload,
  };
};

// Создание статического объекта
export const createObjectCreatedEvent = (obj: UIStaticObject): PlotEvent => {
  return {
    type: EventTypeConst.ObjectCreated,
    payload: {
      name: obj.name,
      object_type: OBJECT_TYPE_REVERSE_MAP[obj.subtype] || 1,
      x_start: obj.col,
      y_start: obj.row,
      width: obj.width,
      height: obj.height,
    } as ObjectCreatedPayload,
  };
};

// Обновление статического объекта
export const createObjectUpdatedEvent = (
  obj: UIStaticObject,
  previousObj?: UIStaticObject,
): PlotEvent => {
  const payload: ObjectUpdatedPayload = {
    object_id: obj.id,
  };

  if (previousObj) {
    if (obj.name !== previousObj.name) payload.name = obj.name;
    if (obj.subtype !== previousObj.subtype) {
      payload.object_type = OBJECT_TYPE_REVERSE_MAP[obj.subtype] || 1;
    }
    if (obj.col !== previousObj.col) payload.x_start = obj.col;
    if (obj.row !== previousObj.row) payload.y_start = obj.row;
    if (obj.width !== previousObj.width) payload.width = obj.width;
    if (obj.height !== previousObj.height) payload.height = obj.height;
  } else {
    payload.name = obj.name;
    payload.object_type = OBJECT_TYPE_REVERSE_MAP[obj.subtype] || 1;
    payload.x_start = obj.col;
    payload.y_start = obj.row;
    payload.width = obj.width;
    payload.height = obj.height;
  }

  return {
    type: EventTypeConst.ObjectUpdated,
    payload,
  };
};

// Удаление статического объекта
export const createObjectDeletedEvent = (objectId: string): PlotEvent => {
  return {
    type: EventTypeConst.ObjectDeleted,
    payload: {
      object_id: objectId,
    } as ObjectDeletedPayload,
  };
};

// Посадка культуры
export const createCropPlantedEvent = (
  bedId: string,
  cropId: number,
  plantDate?: string,
): PlotEvent => {
  const payload: CropPlantedPayload = {
    bed_id: bedId,
    crop_id: cropId,
  };

  if (plantDate) {
    payload.plant_date = plantDate;
  }

  return {
    type: EventTypeConst.CropPlanted,
    payload,
  };
};

// Сбор/удаление культуры
export const createCropRemovedEvent = (
  bedId: string,
  harvested: boolean,
  date?: string,
): PlotEvent => {
  const payload: CropRemovedPayload = {
    bed_id: bedId,
    harvested,
  };

  if (date) {
    payload.date = date;
  }

  return {
    type: EventTypeConst.CropRemoved,
    payload,
  };
};

// ===== КОНВЕРТАЦИЯ ОБЪЕКТОВ В СОБЫТИЯ =====

export const adaptObjectsToEvents = (
  currentObjects: GardenObject[],
  previousObjects: GardenObject[] = [],
): PlotEvent[] => {
  const events: PlotEvent[] = [];

  const created = currentObjects.filter(
    (obj) => !previousObjects.some((p) => p.id === obj.id),
  );

  const deleted = previousObjects.filter(
    (obj) => !currentObjects.some((c) => c.id === obj.id),
  );

  const updated = currentObjects.filter((obj) => {
    const prev = previousObjects.find((p) => p.id === obj.id);
    if (!prev) return false;
    return (
      prev.row !== obj.row ||
      prev.col !== obj.col ||
      prev.width !== obj.width ||
      prev.height !== obj.height ||
      prev.name !== obj.name ||
      (prev.type === "static" &&
        (prev as UIStaticObject).subtype !== (obj as UIStaticObject).subtype)
    );
  });

  created
    .filter((obj) => obj.type === "bed")
    .forEach((bed) => {
      events.push(createBedCreatedEvent(bed as UIBed));
    });

  updated
    .filter((obj) => obj.type === "bed")
    .forEach((bed) => {
      const prev = previousObjects.find((p) => p.id === bed.id) as
        | UIBed
        | undefined;
      events.push(createBedUpdatedEvent(bed as UIBed, prev));
    });

  deleted
    .filter((obj) => obj.type === "bed")
    .forEach((bed) => {
      events.push(createBedDeletedEvent(bed.id));
    });

  created
    .filter((obj) => obj.type === "static")
    .forEach((obj) => {
      events.push(createObjectCreatedEvent(obj as UIStaticObject));
    });

  updated
    .filter((obj) => obj.type === "static")
    .forEach((obj) => {
      const prev = previousObjects.find((p) => p.id === obj.id) as
        | UIStaticObject
        | undefined;
      events.push(createObjectUpdatedEvent(obj as UIStaticObject, prev));
    });

  deleted
    .filter((obj) => obj.type === "static")
    .forEach((obj) => {
      events.push(createObjectDeletedEvent(obj.id));
    });

  return events;
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

export const hasObjectChanged = (
  obj: GardenObject,
  prev: GardenObject,
): boolean => {
  if (obj.type !== prev.type) return true;

  if (obj.type === "bed") {
    const bed = obj as UIBed;
    const prevBed = prev as UIBed;
    return (
      bed.name !== prevBed.name ||
      bed.row !== prevBed.row ||
      bed.col !== prevBed.col ||
      bed.width !== prevBed.width ||
      bed.height !== prevBed.height
    );
  } else {
    const staticObj = obj as UIStaticObject;
    const prevStatic = prev as UIStaticObject;
    return (
      staticObj.name !== prevStatic.name ||
      staticObj.subtype !== prevStatic.subtype ||
      staticObj.row !== prevStatic.row ||
      staticObj.col !== prevStatic.col ||
      staticObj.width !== prevStatic.width ||
      staticObj.height !== prevStatic.height
    );
  }
};

// Добавляем функцию для получения названия культуры по ID
export const getCropNameById = (
  cropId: number | null | undefined,
  crops: UICrop[],
): string | null => {
  if (!cropId) return null;
  const crop = crops.find((c) => c.id === cropId);
  return crop?.name || null;
};

export { OBJECT_TYPE_MAP, OBJECT_TYPE_REVERSE_MAP };
