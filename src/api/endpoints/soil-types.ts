// src/api/endpoints/soil-types.ts
import { api } from '../client';
import type { SoilType } from '../types/crops.types';

const BASE_URL = '/api/v1/soil-types';

export async function getSoilTypes(): Promise<SoilType[]> {
  try {
    const response = await api.get<{ data: SoilType[] }>(BASE_URL);
    console.log('📦 Ответ от API (типы почвы):', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Ошибка загрузки типов почвы:', error);
    return [];
  }
}