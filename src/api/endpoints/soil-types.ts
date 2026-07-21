// src/api/endpoints/soil-types.ts
import { api } from '../client';
import type { SoilType } from '../types/crops.types';

const BASE_URL = '/api/v1/soil-types';

export async function getSoilTypes(): Promise<SoilType[]> {
  try {
    const response = await api.get<{ data: SoilType[] }>(BASE_URL);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
}