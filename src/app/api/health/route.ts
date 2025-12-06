import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getOpenAI } from '@/lib/ai';
import { APP_CONFIG } from '@/lib/constants';
import type { HealthCheckResponse } from '@/types/api';

export async function GET() {
    const health: HealthCheckResponse = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'disconnected',
        },
        version: APP_CONFIG.version,
    };

    try {
        // Check database connection
        try {
            await connectDB();
            health.services.database = 'connected';
        } catch (error) {
            health.status = 'degraded';
            health.services.database = 'disconnected';
        }

        // Check AI service availability
        if (process.env.OPENAI_API_KEY) {
            try {
                // Simple check - just verify the client can be created
                const client = getOpenAI();
                health.services.ai = client ? 'available' : 'unavailable';
            } catch {
                health.services.ai = 'unavailable';
            }
        }

        // Determine overall status
        if (health.services.database === 'disconnected') {
            health.status = 'unhealthy';
        } else if (health.services.ai === 'unavailable') {
            health.status = 'degraded';
        }

        const statusCode = health.status === 'unhealthy' ? 503 : health.status === 'degraded' ? 200 : 200;

        return NextResponse.json(health, { status: statusCode });
    } catch (error) {
        health.success = false;
        health.status = 'unhealthy';
        return NextResponse.json(health, { status: 503 });
    }
}

