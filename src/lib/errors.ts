// Centralized error handling utilities

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// Common error types
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Permission denied') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

export class RateLimitError extends AppError {
    constructor() {
        super('Too many requests. Please try again later.', 429, 'RATE_LIMIT');
    }
}

// Error response formatter
export function formatErrorResponse(error: unknown): { message: string; code?: string; statusCode: number } {
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
        };
    }

    if (error instanceof Error) {
        // Don't expose internal error messages in production
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Handle common error types
        if (error.name === 'ValidationError' || error.message.includes('validation')) {
            return {
                message: error.message,
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            };
        }

        if (error.name === 'MongoServerError' || error.message.includes('duplicate')) {
            return {
                message: isProduction ? 'A resource with this information already exists' : error.message,
                code: 'DUPLICATE_ERROR',
                statusCode: 409,
            };
        }

        return {
            message: isProduction ? 'An unexpected error occurred' : error.message,
            statusCode: 500,
        };
    }

    return {
        message: 'An unexpected error occurred',
        statusCode: 500,
    };
}

// Async error wrapper for API routes
export function withErrorHandler<T>(
    handler: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T | Response> {
    return async (...args) => {
        try {
            return await handler(...args);
        } catch (error) {
            const { message, statusCode } = formatErrorResponse(error);

            // Log error in development
            if (process.env.NODE_ENV !== 'production') {
                console.error('[API Error]', error);
            }

            return Response.json(
                { success: false, error: message },
                { status: statusCode }
            );
        }
    };
}

// Logger utility
export const logger = {
    info: (message: string, data?: object) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
    },
    warn: (message: string, data?: object) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    },
    error: (message: string, error?: unknown) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    },
    debug: (message: string, data?: object) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    },
};
