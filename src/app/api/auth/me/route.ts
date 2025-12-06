import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { formatErrorResponse, logger, AuthenticationError, NotFoundError } from '@/lib/errors';

export async function GET(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        await connectDB();

        const user = await User.findById(auth.userId).select('-password');
        if (!user) {
            throw new NotFoundError('User');
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                skills: user.skills,
                walletAddress: user.walletAddress,
                linkedinUrl: user.linkedinUrl,
                avatarUrl: user.avatarUrl,
                isRecruiter: user.isRecruiter,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Get user error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
