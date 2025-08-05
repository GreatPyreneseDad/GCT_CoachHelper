import { fetchWithErrorHandling, retryWithBackoff, APIError } from './error-utils';

export interface APIClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  onError?: (error: APIError) => void;
}

export class APIClient {
  private config: Required<APIClientConfig>;

  constructor(config: APIClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      headers: config.headers || {},
      timeout: config.timeout || 30000,
      retry: config.retry !== false,
      onError: config.onError || (() => {}),
    };
  }

  private getURL(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.config.baseURL}${path}`;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      };

      const makeRequest = async () => {
        const response = await fetchWithErrorHandling(
          this.getURL(path),
          requestOptions
        );
        
        // Handle empty responses
        const text = await response.text();
        if (!text) {
          return null as T;
        }
        
        try {
          return JSON.parse(text) as T;
        } catch {
          // If response is not JSON, return as text
          return text as T;
        }
      };

      if (this.config.retry) {
        return await retryWithBackoff(makeRequest);
      } else {
        return await makeRequest();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new APIError('Request timeout', 408);
        this.config.onError(timeoutError);
        throw timeoutError;
      }
      
      const apiError = error instanceof APIError 
        ? error 
        : new APIError('Network error', 0);
      
      this.config.onError(apiError);
      throw apiError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    path: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    path: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    path: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Default API client instance
export const apiClient = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
});

// Typed API hooks
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export function useAPIQuery<T>(
  key: string | string[],
  path: string,
  options?: Omit<UseQueryOptions<T, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, APIError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => apiClient.get<T>(path),
    ...options,
  });
}

export function useAPIMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, APIError, TVariables>
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn,
    ...options,
  });
}