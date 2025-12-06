// API Response type definitions

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        bio: string;
        skills: string[];
        linkedinUrl: string;
        walletAddress: string;
        avatarUrl: string;
        isRecruiter: boolean;
    };
    error?: string;
}

export interface JobResponse {
    success: boolean;
    job?: {
        id: string;
        title: string;
        description: string;
        requiredSkills: string[];
        budget: {
            min: number;
            max: number;
            currency: string;
        };
        location: string;
        locationType: 'remote' | 'hybrid' | 'onsite';
        tags: string[];
        poster: {
            id: string;
            name: string;
            avatarUrl: string;
        };
        paymentTxHash: string;
        status: 'active' | 'closed' | 'draft';
        applicants: string[];
        views: number;
        matchScore?: number;
        matchRecommendation?: string;
        createdAt: string;
        updatedAt: string;
    };
    jobs?: Array<JobResponse['job']>;
    pagination?: PaginatedResponse<unknown>['pagination'];
    error?: string;
}

export interface PostResponse {
    success: boolean;
    post?: {
        id: string;
        content: string;
        postType: 'update' | 'question' | 'opportunity' | 'advice';
        author: {
            id: string;
            name: string;
            avatarUrl: string;
        };
        likes: string[];
        comments: Array<{
            id: string;
            content: string;
            author: {
                id: string;
                name: string;
                avatarUrl: string;
            };
            createdAt: string;
        }>;
        createdAt: string;
        updatedAt: string;
    };
    posts?: Array<PostResponse['post']>;
    pagination?: PaginatedResponse<unknown>['pagination'];
    error?: string;
}

export interface ProfileResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        name: string;
        bio: string;
        skills: string[];
        linkedinUrl: string;
        walletAddress: string;
        avatarUrl: string;
        isRecruiter: boolean;
        createdAt: string;
        updatedAt: string;
    };
    error?: string;
}

export interface MatchScoreResponse {
    success: boolean;
    score?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
    recommendation?: string;
    error?: string;
}

export interface InterviewPrepResponse {
    success: boolean;
    questions?: Array<{
        question: string;
        type: 'technical' | 'behavioral' | 'situational';
        tips?: string;
    }>;
    error?: string;
}

export interface HealthCheckResponse {
    success: boolean;
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: 'connected' | 'disconnected';
        ai?: 'available' | 'unavailable';
    };
    version: string;
}

