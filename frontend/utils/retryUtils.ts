import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

const defaultRetryCondition = (error: any): boolean => {
  return (
    !error.response ||
    error.response.status >= 500 ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND'
  );
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const withRetry = async <T = any>(
  apiCall: () => Promise<AxiosResponse<T>>,
  config: RetryConfig = {}
): Promise<AxiosResponse<T>> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = defaultRetryCondition,
  } = config;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiCall();

      if (attempt > 0) {
        console.log(`API call succeeded on attempt ${attempt + 1}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !retryCondition(error)) {
        break;
      }

      console.warn(`API call failed on attempt ${attempt + 1}, retrying in ${retryDelay}ms...`, (error as Error).message);

      await delay(retryDelay * Math.pow(2, attempt));
    }
  }

  console.error(`API call failed after ${maxRetries + 1} attempts`);
  throw lastError;
};

export const createRetryAxios = (baseConfig: RetryConfig = {}) => {
  return {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
      withRetry(() => axios.get<T>(url, config), baseConfig),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      withRetry(() => axios.post<T>(url, data, config), baseConfig),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      withRetry(() => axios.put<T>(url, data, config), baseConfig),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
      withRetry(() => axios.delete<T>(url, config), baseConfig),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      withRetry(() => axios.patch<T>(url, data, config), baseConfig),
  };
};
