'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/lib/toast';

interface UseApiOptions<T> {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
        onSuccess,
        onError,
    } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);
    const toast = useToast();

    const execute = useCallback(async (
        apiCall: () => Promise<Response>,
        customOptions?: Partial<UseApiOptions<T>>
    ) => {
        const opts = { ...options, ...customOptions };
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiCall();
            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || result.message || 'An error occurred';
                setError(errorMessage);

                if (opts.showErrorToast) {
                    toast.error(errorMessage);
                }

                if (opts.onError) {
                    opts.onError(errorMessage);
                }

                return { success: false, error: errorMessage, data: null };
            }

            setData(result.data || result);

            if (opts.showSuccessToast) {
                toast.success(opts.successMessage || 'Operation completed successfully');
            }

            if (opts.onSuccess) {
                opts.onSuccess(result.data || result);
            }

            return { success: true, data: result.data || result, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);

            if (opts.showErrorToast) {
                toast.error(errorMessage);
            }

            if (opts.onError) {
                opts.onError(errorMessage);
            }

            return { success: false, error: errorMessage, data: null };
        } finally {
            setIsLoading(false);
        }
    }, [toast, options]);

    const reset = useCallback(() => {
        setError(null);
        setData(null);
        setIsLoading(false);
    }, []);

    return {
        execute,
        isLoading,
        error,
        data,
        reset,
    };
}

