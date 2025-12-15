import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { generateJobDescription } from '@/lib/ai';
import { sanitizeInput } from '@/lib/sanitize';
import { formatErrorResponse, logger, AuthenticationError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();
        const { title } = body;

        if (!title || typeof title !== 'string') {
            throw new ValidationError('Job title is required');
        }

        const sanitizedTitle = sanitizeInput(title, 200);

        if (sanitizedTitle.trim().length < 2) {
            throw new ValidationError('Job title is too short');
        }

        const description = await generateJobDescription(sanitizedTitle);

        logger.info('Job description generated', { userId: auth.userId, title: sanitizedTitle });

        return NextResponse.json({
            success: true,
            description,
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Job description generation error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
