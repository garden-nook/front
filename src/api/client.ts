import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

// Конфигурация
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://api.dev.192-144-12-78.nip.io/api/v1/";
const API_TIMEOUT = 10000; // 10 секунд

// Создаем экземпляр axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для добавления токена
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

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    // Обработка ошибок
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Перенаправление на логин
      window.location.href = "/login";
    }

    // Пробрасываем ошибку дальше
    return Promise.reject(error);
  },
);

// Типизированные методы
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
