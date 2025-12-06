import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100,      // 100 requests per minute
};

const strictConfig: RateLimitConfig = {
    windowMs: 60 * 1000,
    maxRequests: 10,  // For sensitive endpoints like login
};

// Get client identifier (IP or user ID)
function getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    return ip;
}

// Rate limit check
export function checkRateLimit(
    clientId: string,
    config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitMap.get(clientId);

    // Clean up old entries periodically
    if (rateLimitMap.size > 10000) {
        for (const [key, value] of rateLimitMap.entries()) {
            if (value.resetTime < now) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!record || record.resetTime < now) {
        // New window
        rateLimitMap.set(clientId, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (record.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }

    record.count++;
    return { allowed: true, remaining: config.maxRequests - record.count, resetIn: record.resetTime - now };
}

// Rate limit middleware helper
export function withRateLimit(
    handler: (request: NextRequest) => Promise<NextResponse>,
    config?: RateLimitConfig
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const clientId = getClientId(request);
        const result = checkRateLimit(clientId, config);

        if (!result.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
                        'Retry-After': String(Math.ceil(result.resetIn / 1000)),
                    },
                }
            );
        }

        const response = await handler(request);

        // Add rate limit headers
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetIn / 1000)));

        return response;
    };
}

// Strict rate limit for auth endpoints
export function withStrictRateLimit(handler: (request: NextRequest) => Promise<NextResponse>) {
    return withRateLimit(handler, strictConfig);
}

// Export configs for custom use
export { defaultConfig, strictConfig };
export type { RateLimitConfig };
