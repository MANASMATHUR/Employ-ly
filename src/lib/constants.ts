// Application constants

export const APP_CONFIG = {
    name: 'Employly',
    description: 'AI-Powered Job Matching & Web3 Networking',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Authentication
export const AUTH_CONFIG = {
    tokenExpiry: '7d',
    passwordMinLength: 6,
    passwordMaxLength: 128,
    jwtSecretRequired: true,
} as const;

// Rate Limiting
export const RATE_LIMIT = {
    default: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
    },
    strict: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
    },
    login: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
    },
} as const;

// Pagination
export const PAGINATION = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
    name: { min: 2, max: 100 },
    bio: { max: 2000 },
    email: { max: 255 },
    password: { min: 6, max: 128 },
    jobTitle: { min: 5, max: 200 },
    jobDescription: { min: 50, max: 10000 },
    skills: { max: 20, skillMaxLength: 50 },
    jobSkills: { min: 1, max: 15 },
    tags: { max: 10, tagMaxLength: 30 },
    postContent: { max: 2000 },
    commentContent: { max: 500 },
    coverLetter: { max: 2000 },
} as const;

// Web3 Configuration
export const WEB3_CONFIG = {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80001'),
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://rpc-mumbai.maticvigil.com',
    adminWallet: process.env.NEXT_PUBLIC_ADMIN_WALLET || '',
    jobPostingFee: '0.00001', // MATIC
    networkName: 'Polygon Mumbai',
} as const;

// AI Configuration
export const AI_CONFIG = {
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 500,
    maxSkills: 15,
} as const;

// Job Status
export const JOB_STATUS = {
    ACTIVE: 'active',
    CLOSED: 'closed',
    DRAFT: 'draft',
} as const;

// Location Types
export const LOCATION_TYPES = {
    REMOTE: 'remote',
    HYBRID: 'hybrid',
    ONSITE: 'onsite',
} as const;

// Post Types
export const POST_TYPES = {
    UPDATE: 'update',
    QUESTION: 'question',
    OPPORTUNITY: 'opportunity',
    ADVICE: 'advice',
} as const;

// Match Score Thresholds
export const MATCH_SCORE = {
    EXCELLENT: 80,
    GOOD: 60,
    FAIR: 40,
} as const;

// Currency Options
export const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP'] as const;

// Error Messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Permission denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'An unexpected error occurred',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    INVALID_TOKEN: 'Invalid or expired token',
    USER_NOT_FOUND: 'User not found',
    JOB_NOT_FOUND: 'Job not found',
    POST_NOT_FOUND: 'Post not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    PAYMENT_REQUIRED: 'Payment verification failed',
    TRANSACTION_USED: 'Transaction already used',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful',
    REGISTER: 'Registration successful',
    LOGOUT: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    JOB_CREATED: 'Job posted successfully',
    JOB_APPLIED: 'Application submitted successfully',
    POST_CREATED: 'Post created successfully',
    COMMENT_CREATED: 'Comment added successfully',
} as const;

// API Routes
export const API_ROUTES = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
    },
    JOBS: {
        LIST: '/api/jobs',
        CREATE: '/api/jobs',
        GET: (id: string) => `/api/jobs/${id}`,
        APPLY: (id: string) => `/api/jobs/${id}/apply`,
        INTERVIEW_PREP: (id: string) => `/api/jobs/${id}/interview-prep`,
    },
    FEED: {
        LIST: '/api/feed',
        CREATE: '/api/feed',
        LIKE: (id: string) => `/api/feed/${id}/like`,
        COMMENT: (id: string) => `/api/feed/${id}/comment`,
    },
    PROFILE: {
        GET: '/api/profile',
        UPDATE: '/api/profile',
        EXTRACT_SKILLS: '/api/profile/extract-skills',
    },
    HEALTH: '/api/health',
} as const;

