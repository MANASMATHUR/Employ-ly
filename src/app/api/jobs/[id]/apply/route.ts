import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/lib/auth';
import { applyJobSchema, validateRequest } from '@/lib/validations';
import { formatErrorResponse, logger, AuthenticationError, NotFoundError, ValidationError, ConflictError } from '@/lib/errors';
import mongoose from 'mongoose';

// POST - Apply to a job
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

        // Validate input (coverLetter is optional)
        if (body.coverLetter !== undefined) {
            const validation = validateRequest(applyJobSchema, body);
            if (!validation.success) {
                throw new ValidationError(validation.error);
            }
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

        if (job.status !== 'active') {
            throw new ValidationError('Job is not active');
        }

        const userId = new mongoose.Types.ObjectId(auth.userId);

        // Check if already applied
        const hasApplied = job.applicants.some(appId => appId.toString() === userId.toString());
        if (hasApplied) {
            throw new ConflictError('You have already applied to this job');
        }

        // Add applicant
        await Job.findByIdAndUpdate(id, {
            $addToSet: { applicants: userId },
        });

        logger.info('Job application submitted', { jobId: id, userId: auth.userId });

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully',
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Apply to job error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
