import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getUserFromRequest } from '@/lib/auth';
import { createCommentSchema, validateRequest } from '@/lib/validations';
import { sanitizeInput } from '@/lib/sanitize';
import { formatErrorResponse, logger, AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { VALIDATION_LIMITS } from '@/lib/constants';
import mongoose from 'mongoose';

// POST - Add comment to a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();

        // Validate input
        const validation = validateRequest(createCommentSchema, body);
        if (!validation.success) {
            throw new ValidationError(validation.error);
        }

        const { content } = validation.data;

        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new NotFoundError('Post');
        }

        const post = await Post.findById(id);
        if (!post) {
            throw new NotFoundError('Post');
        }

        // Sanitize content
        const sanitizedContent = sanitizeInput(content, VALIDATION_LIMITS.commentContent.max);

        await Post.findByIdAndUpdate(id, {
            $push: {
                comments: {
                    author: new mongoose.Types.ObjectId(auth.userId),
                    content: sanitizedContent,
                    createdAt: new Date(),
                },
            },
        });

        const updatedPost = await Post.findById(id)
            .populate('comments.author', 'name avatarUrl')
            .lean();

        logger.info('Comment added', { postId: id, userId: auth.userId });

        return NextResponse.json({
            success: true,
            comments: (updatedPost as any)?.comments || [],
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Add comment error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
