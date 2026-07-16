// src/api/client.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

// Конфигурация
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.dev.192-144-12-78.nip.io";
const API_TIMEOUT = 10000; // 10 секунд

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== ИНТЕРЦЕПТОР ЗАПРОСА =====
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ===== ИНТЕРЦЕПТОР ОТВЕТА =====
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    // ✅ Базовый объект ошибки
    const errorResponse = {
      success: false,
      status: 0,
      message: "Неизвестная ошибка",
      // ❌ Убираем поле data — оно не нужно
    };

    if (error.response) {
      const { status, data } = error.response;

      errorResponse.status = status;

      // ✅ Извлекаем сообщение из разных форматов
      if (data && typeof data === "object") {
        const dataObj = data as Record<string, any>;

        // ✅ Только сообщение, без дублирования данных
        errorResponse.message =
          dataObj.error ||
          dataObj.message ||
          dataObj.data?.error ||
          `Ошибка ${status}`;

        // ❌ НЕ сохраняем dataObj
      } else if (typeof data === "string") {
        errorResponse.message = data;
      } else {
        errorResponse.message = `Ошибка ${status}`;
      }

      // ✅ Обработка 401
      if (status === 401) {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    } else {
      // ✅ Ошибка сети
      errorResponse.message = error.message || "Ошибка сети";
    }

    return Promise.reject(errorResponse);
  },
);

// ===== ТИПИЗИРОВАННЫЕ МЕТОДЫ =====
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<T, T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.post<T, T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.put<T, T>(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.patch<T, T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<T, T>(url, config),
};
