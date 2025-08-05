import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface ErrorState {
  message?: string;
  field?: string;
  code?: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    let errorCode: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (
      error &&
      typeof error === 'object' &&
      'message' in error
    ) {
      errorMessage = String(error.message);
      if ('code' in error) {
        errorCode = String(error.code);
      }
    }
    
    // Handle specific error codes
    switch (errorCode) {
      case 'NETWORK_ERROR':
        errorMessage = 'Network connection error. Please check your internet connection.';
        break;
      case 'AUTH_REQUIRED':
        errorMessage = 'Please sign in to continue.';
        break;
      case 'PERMISSION_DENIED':
        errorMessage = 'You don\'t have permission to perform this action.';
        break;
      case 'VALIDATION_ERROR':
        // Don't override validation errors
        break;
      default:
        if (errorMessage.includes('fetch')) {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        }
    }
    
    setError({ message: errorMessage, code: errorCode });
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (fn: () => Promise<void>) => {
    setIsRetrying(true);
    clearError();
    
    try {
      await fn();
    } catch (error) {
      handleError(error);
    } finally {
      setIsRetrying(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
  };
}

// Async error handler wrapper
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    onError?: (error: unknown) => void;
    context?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (options?.onError) {
        options.onError(error);
      } else {
        console.error(`Error${options?.context ? ` in ${options.context}` : ''}:`, error);
        toast.error(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        );
      }
      throw error;
    }
  }) as T;
}