// ============================================================
// API ДЛЯ КУЛЬТУР
// ============================================================

// Базовый URL API (из свагера)
const API_BASE_URL = 'https://api.dev.192-144-12-78.nip.io';

// Типы данных из свагера
export interface SunNeeds {
  id: number;
  name: string;
}

export interface Crop {
  id: number;
  name: string;
  family_id: number;
  family_name: string;
  vegetation_days_avg: number;
  sun_needs: number; // 1 — тень, 2 — полутень, 3 — солнце
  created_at: string;
}

export interface CropFamily {
  id: number;
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  success: boolean;
}

// ============================================================
// 1. ПОЛУЧИТЬ СПИСОК КУЛЬТУР
// ============================================================
export async function getCrops(params?: {
  family_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Crop[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/crops`);
  
  if (params) {
    if (params.family_id) url.searchParams.append('family_id', String(params.family_id));
    if (params.search) url.searchParams.append('search', params.search);
    if (params.page) url.searchParams.append('page', String(params.page));
    if (params.limit) url.searchParams.append('limit', String(params.limit));
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Ответ от API:', result);

    // ✅ Если data === null или undefined, возвращаем пустой массив
    if (!result.data) {
      return [];
    }

    // ✅ Если data — массив, возвращаем его
    if (Array.isArray(result.data)) {
      return result.data;
    }

    // Если data — объект (не массив), возвращаем пустой массив
    console.warn('⚠️ data не является массивом:', result.data);
    return [];
  } catch (error) {
    console.error('❌ Ошибка при получении культур:', error);
    throw error;
  }
}

// ============================================================
// 2. ПОЛУЧИТЬ КУЛЬТУРУ ПО ID
// ============================================================
export async function getCropById(id: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/crops/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📦 Детали культуры ${id}:`, result);

    // ✅ Если data === null или undefined, возвращаем null
    if (!result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(`❌ Ошибка при получении культуры с ID ${id}:`, error);
    throw error;
  }
}

// ============================================================
// 3. ПОЛУЧИТЬ СПИСОК СЕМЕЙСТВ
// ============================================================
export async function getCropFamilies(): Promise<CropFamily[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/crop-families`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Семейства:', result);

    if (!result.data) {
      return [];
    }

    if (Array.isArray(result.data)) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error('❌ Ошибка при получении семейств:', error);
    throw error;
  }
}