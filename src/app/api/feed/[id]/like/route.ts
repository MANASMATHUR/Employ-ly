import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getUserFromRequest } from '@/lib/auth';
import { formatErrorResponse, logger, AuthenticationError, NotFoundError } from '@/lib/errors';
import mongoose from 'mongoose';

// POST - Like/unlike a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new NotFoundError('Post');
        }

        const post = await Post.findById(id);
        if (!post) {
            throw new NotFoundError('Post');
        }

        const userId = new mongoose.Types.ObjectId(auth.userId);
        const hasLiked = post.likes.some(likeId => likeId.toString() === userId.toString());

        if (hasLiked) {
            // Unlike
            await Post.findByIdAndUpdate(id, {
                $pull: { likes: userId },
            });
        } else {
            // Like
            await Post.findByIdAndUpdate(id, {
                $addToSet: { likes: userId },
            });
        }

        // Get updated post with likes count
        const updatedPost = await Post.findById(id).select('likes').lean();

        logger.info('Post liked/unliked', { postId: id, userId: auth.userId, action: hasLiked ? 'unliked' : 'liked' });

        return NextResponse.json({
            success: true,
            liked: !hasLiked,
            likes: updatedPost?.likes || [],
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Like post error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
