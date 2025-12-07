import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { updateProfileSchema, validateRequest } from '@/lib/validations';
import { sanitizeInput, sanitizeUrl, sanitizeWalletAddress, sanitizeStringArray } from '@/lib/sanitize';
import { verifyMessage } from '@/lib/web3';
import { formatErrorResponse, logger, NotFoundError, AuthenticationError } from '@/lib/errors';
import { VALIDATION_LIMITS } from '@/lib/constants';

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
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Get profile error', error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();

        // Validate input
        const validation = validateRequest(updateProfileSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { name, bio, skills, walletAddress, linkedinUrl, avatarUrl, isRecruiter } = validation.data;

        await connectDB();

        // Build update object with sanitization
        const updateData: Record<string, unknown> = {};

        if (name !== undefined) {
            updateData.name = sanitizeInput(name, VALIDATION_LIMITS.name.max);
        }
        if (bio !== undefined) {
            updateData.bio = sanitizeInput(bio, VALIDATION_LIMITS.bio.max);
        }
        if (skills !== undefined) {
            updateData.skills = sanitizeStringArray(skills, VALIDATION_LIMITS.skills.skillMaxLength);
        }
        if (walletAddress !== undefined && walletAddress) {
            const sanitized = sanitizeWalletAddress(walletAddress);
            if (sanitized) {
                // Verify signature if provided (SECURITY)
                const { signature, message } = body;
                if (signature && message) {
                    const recoveredAddress = verifyMessage(message, signature);
                    if (recoveredAddress.toLowerCase() !== sanitized.toLowerCase()) {
                        return NextResponse.json(
                            { success: false, error: 'Invalid wallet signature' },
                            { status: 401 }
                        );
                    }
                }

                updateData.walletAddress = sanitized;
            } else {
                return NextResponse.json(
                    { success: false, error: 'Invalid wallet address format' },
                    { status: 400 }
                );
            }
        } else if (walletAddress === '') {
            updateData.walletAddress = '';
        }
        if (linkedinUrl !== undefined && linkedinUrl) {
            const sanitized = sanitizeUrl(linkedinUrl);
            if (sanitized) {
                updateData.linkedinUrl = sanitized;
            } else {
                return NextResponse.json(
                    { success: false, error: 'Invalid LinkedIn URL format' },
                    { status: 400 }
                );
            }
        } else if (linkedinUrl === '') {
            updateData.linkedinUrl = '';
        }
        if (avatarUrl !== undefined && avatarUrl) {
            updateData.avatarUrl = sanitizeUrl(avatarUrl);
        }
        if (isRecruiter !== undefined) {
            updateData.isRecruiter = Boolean(isRecruiter);
        }

        const user = await User.findByIdAndUpdate(
            auth.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new NotFoundError('User');
        }

        logger.info('Profile updated', { userId: auth.userId });

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
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Update profile error', error);
        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}
