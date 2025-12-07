import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, createToken } from '@/lib/auth';
import { registerSchema, validateRequest } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/errors';

export async function POST(request: NextRequest) {
    // Rate limiting for auth endpoints (10 requests per minute)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimit = checkRateLimit(`register:${clientIp}`, { windowMs: 60000, maxRequests: 10 });

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { success: false, error: 'Too many registration attempts. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) }
            }
        );
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = validateRequest(registerSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { email, password, name } = validation.data;

        await connectDB();

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name.trim(),
        });

        logger.info('User registered', { userId: user._id.toString(), email: user.email });

        // Create JWT token
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
                skills: user.skills || [],
            },
        });
    } catch (error: unknown) {
        logger.error('Registration error', error as Error);

        // Handle MongoDB duplicate key error
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
