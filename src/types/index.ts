// Shared TypeScript types for the application


export interface User {
    id: string;
    _id?: string;
    email: string;
    name: string;
    bio?: string;
    skills: string[];
    linkedinUrl?: string;
    walletAddress?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}


export interface Job {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    budget: Budget;
    location: string;
    locationType: 'remote' | 'hybrid' | 'onsite';
    tags: string[];
    poster: JobPoster;
    applicants: JobApplicant[];
    paymentTxHash: string;
    status: 'active' | 'closed' | 'draft';
    views: number;
    createdAt: string;
    updatedAt: string;
    matchData?: MatchData;
}

export interface Budget {
    min: number;
    max: number;
    currency: string;
}

export interface JobPoster {
    _id: string;
    name: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    linkedinUrl?: string;
}

export interface JobApplicant {
    _id: string;
    name: string;
    email?: string;
    skills?: string[];
    avatarUrl?: string;
    appliedAt?: string;
}

export interface MatchData {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendation: string;
}


export interface Post {
    _id: string;
    content: string;
    postType: 'update' | 'question' | 'opportunity' | 'advice';
    author: PostAuthor;
    likes: string[];
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface PostAuthor {
    _id: string;
    name: string;
    avatarUrl?: string;
}

export interface Comment {
    _id: string;
    content: string;
    author: { _id: string; name: string };
    createdAt: string;
}


export interface ExternalJob {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    budget: Budget;
    location: string;
    locationType: string;
    tags: string[];
    poster: { name: string; avatarUrl?: string };
    createdAt: string;
    source: 'external';
    externalUrl: string;
    companyLogo?: string;
}


export interface ScrapedJob {
    _id: string;
    sourceId: string;
    source: 'remoteok' | 'indeed' | 'linkedin' | 'manual';
    sourceUrl: string;
    title: string;
    company: string;
    companyLogo?: string;
    descriptionRaw: string;
    descriptionClean: string;
    requirements: {
        skills: string[];
        experience?: string;
        education?: string;
        languages: string[];
    };
    salary: {
        min?: number;
        max?: number;
        currency: string;
        period: 'hourly' | 'monthly' | 'annual';
    };
    location: string;
    locationType: 'remote' | 'hybrid' | 'onsite';
    country?: string;
    timezone?: string;
    category: string;
    tags: string[];
    seniority: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'executive';
    labels: {
        isValid: boolean;
        qualityScore?: number;
        categories?: string[];
    };
    postedAt: Date;
    scrapedAt: Date;
    updatedAt: Date;
}


export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}


export interface TransactionResult {
    success: boolean;
    txHash?: string;
    error?: string;
}

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    chainId: number | null;
}


export interface InterviewQuestion {
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    tip: string;
}

export interface InterviewPrepResponse {
    success: boolean;
    questions: InterviewQuestion[];
    jobTitle: string;
    generatedAt: string;
}
