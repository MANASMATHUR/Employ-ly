import { z } from 'zod';

// ============ Auth Schemas ============
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

// ============ Profile Schemas ============
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().max(1000).optional(),
    skills: z.array(z.string().max(50)).max(20).optional(),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional().or(z.literal('')),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    isRecruiter: z.boolean().optional(),
});

// ============ Job Schemas ============
export const createJobSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
    requiredSkills: z.array(z.string().max(50)).min(1, 'At least one skill required').max(15),
    budget: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        currency: z.enum(['USD', 'EUR', 'INR', 'GBP']),
    }),
    location: z.string().min(2).max(100),
    locationType: z.enum(['remote', 'hybrid', 'onsite']),
    tags: z.array(z.string().max(30)).max(10).optional(),
    paymentTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
});

export const applyJobSchema = z.object({
    coverLetter: z.string().max(2000).optional(),
});

// ============ Feed Schemas ============
export const createPostSchema = z.object({
    content: z.string().min(1, 'Content is required').max(2000),
    postType: z.enum(['update', 'question', 'opportunity', 'advice']).default('update'),
});

export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment is required').max(500),
});

// ============ Query Schemas ============
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export const jobFilterSchema = z.object({
    search: z.string().max(100).optional(),
    skills: z.string().optional(), // comma-separated
    location: z.string().max(100).optional(),
    locationType: z.enum(['remote', 'hybrid', 'onsite']).optional(),
    minBudget: z.coerce.number().min(0).optional(),
    maxBudget: z.coerce.number().min(0).optional(),
    status: z.enum(['active', 'closed', 'draft']).optional(),
});

// ============ Validation Helper ============
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
        const parsed = schema.parse(data);
        return { success: true, data: parsed };
    } catch (err) {
        if (err instanceof z.ZodError) {
            const firstError = err.issues[0];
            return { success: false, error: firstError?.message || 'Validation failed' };
        }
        return { success: false, error: 'Validation failed' };
    }
}

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type JobFilterInput = z.infer<typeof jobFilterSchema>;
