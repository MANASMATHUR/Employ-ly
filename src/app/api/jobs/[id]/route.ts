import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { calculateMatchScore } from '@/lib/ai';
import { formatErrorResponse, logger, NotFoundError, AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors';
import { sanitizeInput, sanitizeStringArray } from '@/lib/sanitize';
import { VALIDATION_LIMITS } from '@/lib/constants';
import { updateJobSchema, validateRequest } from '@/lib/validations';
import mongoose from 'mongoose';

// GET - Get single job by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new NotFoundError('Job');
        }

        const job = await Job.findById(id)
            .populate('poster', 'name bio avatarUrl skills linkedinUrl')
            .populate('applicants', 'name avatarUrl skills')
            .lean();

        if (!job) {
            throw new NotFoundError('Job');
        }

        // Increment views
        await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

        // Calculate match score if user is authenticated
        let matchData = null;
        const auth = await getUserFromRequest(request);
        if (auth) {
            const user = await User.findById(auth.userId);
            if (user) {
                matchData = await calculateMatchScore(
                    user.skills,
                    user.bio,
                    (job as any).requiredSkills,
                    (job as any).description
                );
            }
        }

        return NextResponse.json({
            success: true,
            job: { ...job, matchData },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Get job error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}

// PUT - Update job
export async function PUT(
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
            throw new NotFoundError('Job');
        }

        const job = await Job.findById(id);
        if (!job) {
            throw new NotFoundError('Job');
        }

        // Only poster can update
        if (job.poster.toString() !== auth.userId) {
            throw new AuthorizationError('Only the job poster can update this job');
        }

        const body = await request.json();

        // Validate input
        const validation = validateRequest(updateJobSchema, body);
        if (!validation.success) {
            throw new ValidationError(validation.error);
        }

        const { title, description, requiredSkills, budget, location, locationType, tags, status } = validation.data;

        const updateData: Record<string, any> = {};
        if (title !== undefined) updateData.title = sanitizeInput(title, VALIDATION_LIMITS.jobTitle.max);
        if (description !== undefined) updateData.description = sanitizeInput(description, VALIDATION_LIMITS.jobDescription.max);
        if (requiredSkills !== undefined) updateData.requiredSkills = sanitizeStringArray(requiredSkills, VALIDATION_LIMITS.jobSkills.skillMaxLength);
        if (budget !== undefined) updateData.budget = budget;
        if (location !== undefined) updateData.location = sanitizeInput(location, 100);
        if (locationType !== undefined) updateData.locationType = locationType;
        if (tags !== undefined) updateData.tags = sanitizeStringArray(tags, VALIDATION_LIMITS.tags.tagMaxLength);
        if (status !== undefined) updateData.status = status;

        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('poster', 'name avatarUrl');

        logger.info('Job updated', { jobId: id, userId: auth.userId });

        return NextResponse.json({
            success: true,
            job: updatedJob,
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Update job error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}

// DELETE - Delete job
export async function DELETE(
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
            throw new NotFoundError('Job');
        }

        const job = await Job.findById(id);
        if (!job) {
            throw new NotFoundError('Job');
        }

        if (job.poster.toString() !== auth.userId) {
            throw new AuthorizationError('Only the job poster can delete this job');
        }

        await Job.findByIdAndDelete(id);

        logger.info('Job deleted', { jobId: id, userId: auth.userId });

        return NextResponse.json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Delete job error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
