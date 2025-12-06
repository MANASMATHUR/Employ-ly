import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, createToken } from '@/lib/auth';
import { loginSchema, validateRequest } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/errors';

export async function POST(request: NextRequest) {
    // Strict rate limiting for login (5 attempts per minute per IP)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimit = checkRateLimit(`login:${clientIp}`, { windowMs: 60000, maxRequests: 5 });

    if (!rateLimit.allowed) {
        logger.warn('Login rate limit exceeded', { ip: clientIp });
        return NextResponse.json(
            { success: false, error: 'Too many login attempts. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) }
            }
        );
    }

    try {
        const body = await request.json();

        // Validate input
        const validation = validateRequest(loginSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        await connectDB();

        // Find user - use select to explicitly include password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            // Use same error message to prevent user enumeration
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            logger.warn('Failed login attempt', { email: email.toLowerCase() });
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        logger.info('User logged in', { userId: user._id.toString() });

        // Create token
        const token = createToken({
            userId: user._id.toString(),
            email: user.email,
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                skills: user.skills,
                linkedinUrl: user.linkedinUrl,
                walletAddress: user.walletAddress,
            },
        });
    } catch (error: any) {
        logger.error('Login error', error);
        return NextResponse.json(
            { success: false, error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
