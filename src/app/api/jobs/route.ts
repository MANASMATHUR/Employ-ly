import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { verifyTransaction } from '@/lib/web3';
import { calculateMatchScore } from '@/lib/ai';
import { createJobSchema, validateRequest } from '@/lib/validations';
import { sanitizeInput, sanitizeStringArray, sanitizeTxHash } from '@/lib/sanitize';
import { formatErrorResponse, logger, AuthenticationError, ValidationError, ConflictError } from '@/lib/errors';
import { VALIDATION_LIMITS } from '@/lib/constants';

// GET - List jobs with filters
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skills = searchParams.get('skills')?.split(',').filter(Boolean);
        const location = searchParams.get('location');
        const locationType = searchParams.get('locationType');
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search');
        const status = searchParams.get('status') || 'active';

        // Build query
        const query: Record<string, any> = { status };

        if (skills && skills.length > 0) {
            query.requiredSkills = { $in: skills };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (locationType) {
            query.locationType = locationType;
        }

        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('poster', 'name avatarUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Job.countDocuments(query),
        ]);

        // If user is authenticated, calculate match scores
        const auth = await getUserFromRequest(request);
        let jobsWithScores = jobs;

        if (auth) {
            const user = await User.findById(auth.userId);
            if (user) {
                jobsWithScores = await Promise.all(
                    jobs.map(async (job: any) => {
                        const match = await calculateMatchScore(
                            user.skills,
                            user.bio,
                            job.requiredSkills,
                            job.description
                        );
                        return { ...job, matchScore: match.score, matchRecommendation: match.recommendation };
                    })
                );
            }
        }

        return NextResponse.json({
            success: true,
            jobs: jobsWithScores,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Get jobs error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}

// POST - Create new job (requires payment)
export async function POST(request: NextRequest) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const body = await request.json();

        // Validate input
        const validation = validateRequest(createJobSchema, body);
        if (!validation.success) {
            throw new ValidationError(validation.error);
        }

        const {
            title,
            description,
            requiredSkills,
            budget,
            location,
            locationType,
            tags,
            paymentTxHash,
        } = validation.data;

        await connectDB();

        // Sanitize transaction hash
        const sanitizedTxHash = sanitizeTxHash(paymentTxHash);
        if (!sanitizedTxHash) {
            throw new ValidationError('Invalid transaction hash format');
        }

        // Verify payment on blockchain
        const isPaymentValid = await verifyTransaction(sanitizedTxHash);
        if (!isPaymentValid) {
            throw new ValidationError('Payment verification failed. Please ensure the transaction is confirmed.');
        }

        // Check if txHash was already used
        const existingJob = await Job.findOne({ paymentTxHash: sanitizedTxHash });
        if (existingJob) {
            throw new ConflictError('This transaction has already been used for a job posting');
        }

        // Sanitize inputs
        const sanitizedTitle = sanitizeInput(title, VALIDATION_LIMITS.jobTitle.max);
        const sanitizedDescription = sanitizeInput(description, VALIDATION_LIMITS.jobDescription.max);
        const sanitizedSkills = sanitizeStringArray(requiredSkills, VALIDATION_LIMITS.jobSkills.skillMaxLength);
        const sanitizedLocation = sanitizeInput(location, 100);
        const sanitizedTags = tags ? sanitizeStringArray(tags, VALIDATION_LIMITS.tags.tagMaxLength) : [];

        // Create job
        const job = await Job.create({
            title: sanitizedTitle,
            description: sanitizedDescription,
            requiredSkills: sanitizedSkills,
            budget: budget || { min: 0, max: 0, currency: 'USD' },
            location: sanitizedLocation || 'Remote',
            locationType: locationType || 'remote',
            tags: sanitizedTags,
            poster: auth.userId,
            paymentTxHash: sanitizedTxHash,
            status: 'active',
        });

        logger.info('Job created', { jobId: job._id.toString(), userId: auth.userId });

        return NextResponse.json({
            success: true,
            job: {
                id: job._id,
                title: job.title,
                createdAt: job.createdAt,
            },
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Create job error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
