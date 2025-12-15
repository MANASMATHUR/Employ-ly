import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { extractSkills } from '@/lib/ai';
import { sanitizeInput } from '@/lib/sanitize';
import { formatErrorResponse, logger, AuthenticationError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            throw new ValidationError('Description text is required');
        }

        const sanitizedText = sanitizeInput(text, 5000);

        if (sanitizedText.trim().length < 10) {
            throw new ValidationError('Please provide at least 10 characters of description to analyze');
        }

        const result = await extractSkills(sanitizedText);

        logger.info('Job skills extracted', { userId: auth.userId, skillCount: result.skills.length });

        return NextResponse.json({
            success: true,
            skills: result.skills,
            confidence: result.confidence,
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Job skill extraction error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
