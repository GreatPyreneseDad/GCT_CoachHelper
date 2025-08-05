export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Error parsing utilities
export function parseAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }
  
  if (error instanceof Response) {
    return new APIError(
      `HTTP ${error.status}: ${error.statusText}`,
      error.status
    );
  }
  
  if (error && typeof error === 'object') {
    const e = error as any;
    return new APIError(
      e.message || 'Unknown error',
      e.status,
      e.code,
      e.details
    );
  }
  
  return new APIError(String(error));
}

// Fetch wrapper with error handling
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // Response might not be JSON
      }
      
      throw new APIError(
        errorData?.message || `HTTP ${response.status}`,
        response.status,
        errorData?.code,
        errorData?.details
      );
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to server');
    }
    throw error;
  }
}

// Retry logic for transient errors
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      if (error instanceof APIError) {
        // Retry on 5xx errors or network errors
        return !error.status || error.status >= 500;
      }
      return error instanceof NetworkError;
    },
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}