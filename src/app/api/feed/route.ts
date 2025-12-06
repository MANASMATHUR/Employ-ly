import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getUserFromRequest } from '@/lib/auth';
import { createPostSchema, validateRequest } from '@/lib/validations';
import { sanitizeInput } from '@/lib/sanitize';
import { formatErrorResponse, logger, AuthenticationError, ValidationError } from '@/lib/errors';
import { VALIDATION_LIMITS } from '@/lib/constants';

// GET - List feed posts
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');

        const query: Record<string, any> = {};
        if (type) {
            query.postType = type;
        }

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find(query)
                .populate('author', 'name avatarUrl bio')
                .populate('comments.author', 'name avatarUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Get feed error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}

// POST - Create new post
export async function POST(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();

        // Validate input
        const validation = validateRequest(createPostSchema, body);
        if (!validation.success) {
            throw new ValidationError(validation.error);
        }

        const { content, postType } = validation.data;

        await connectDB();

        // Sanitize content
        const sanitizedContent = sanitizeInput(content, VALIDATION_LIMITS.postContent.max);

        const post = await Post.create({
            author: auth.userId,
            content: sanitizedContent,
            postType: postType || 'update',
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name avatarUrl bio')
            .lean();

        logger.info('Post created', { postId: post._id.toString(), userId: auth.userId });

        return NextResponse.json({
            success: true,
            post: populatedPost,
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Create post error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
