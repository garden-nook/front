// src/api/endpoints/plot-structure.ts
import { api } from "../client";
import type { BedCropHistoryEntry, PlotEvents, PlotStructure } from "../types/plot.types";
import type { RecommendationResponse } from "../types/recommendation";

const BASE_URL = "/api/v1/plots";

// ===== ЭНДПОИНТЫ ДЛЯ РАБОТЫ СО СТРУКТУРОЙ УЧАСТКА =====

/**
 * Получить структуру участка (грядки, объекты, тени)
 */
export async function getPlotStructure(plotId: string): Promise<PlotStructure> {
  const response = await api.get<{ data: PlotStructure }>(`${BASE_URL}/${plotId}/structure`);
  return response.data.data;
}

/**
 * Отправить события изменения структуры участка
 * (создание/обновление/удаление грядок, посадка/сбор культур)
 */
export async function sendPlotEvents(plotId: string, events: PlotEvents): Promise<void> {
  await api.post(`${BASE_URL}/${plotId}/events`, events);
}

/**
 * Получить историю посадок для грядки
 */
export async function getBedHistory(bedId: string): Promise<BedCropHistoryEntry[]> {
  const response = await api.get<{ data: BedCropHistoryEntry[] }>(
    `/api/v1/plots/bed/${bedId}/history`,
  );
  return response.data.data;
}

export async function getRecommendations(
  bedId: string,
  search: string,
  limit: number,
  searchLimit: number,
  disableFilters: boolean,
) {
  const response = await api.get<{ data: RecommendationResponse }>(
    `/api/v1/plots/bed/${bedId}/recommendation`,
    {
      params: { search, limit, searchLimit, disableFilters },
    },
  );
  return response.data.data;
}
