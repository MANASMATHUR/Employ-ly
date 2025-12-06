import { NextRequest, NextResponse } from 'next/server';

interface RemoteOKJob {
    id: string;
    slug: string;
    company: string;
    company_logo: string;
    position: string;
    tags: string[];
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    date: string;
    url: string;
}

interface NormalizedJob {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    budget: { min: number; max: number; currency: string };
    location: string;
    locationType: string;
    tags: string[];
    poster: { name: string; avatarUrl?: string };
    createdAt: string;
    source: 'external';
    externalUrl: string;
    companyLogo?: string;
}

// Cache jobs for 5 minutes to avoid rate limiting
let cachedJobs: NormalizedJob[] = [];
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchRemoteOKJobs(): Promise<NormalizedJob[]> {
    try {
        const res = await fetch('https://remoteok.com/api', {
            headers: {
                'User-Agent': 'Employly Job Portal',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!res.ok) {
            console.error('RemoteOK API error:', res.status);
            return [];
        }

        const data = await res.json();

        // First item is metadata, skip it
        const jobs: RemoteOKJob[] = Array.isArray(data) ? data.slice(1) : [];

        return jobs.slice(0, 20).map((job): NormalizedJob => ({
            _id: `remote-${job.id}`,
            title: job.position,
            description: cleanDescription(job.description),
            requiredSkills: job.tags?.slice(0, 6) || [],
            budget: {
                min: job.salary_min || 0,
                max: job.salary_max || 0,
                currency: 'USD',
            },
            location: job.location || 'Remote',
            locationType: 'remote',
            tags: job.tags?.slice(0, 4) || [],
            poster: {
                name: job.company,
                avatarUrl: job.company_logo || undefined,
            },
            createdAt: job.date,
            source: 'external',
            externalUrl: job.url,
            companyLogo: job.company_logo || undefined,
        }));
    } catch (error) {
        console.error('Failed to fetch RemoteOK jobs:', error);
        return [];
    }
}

function cleanDescription(html: string): string {
    if (!html) return '';
    // Strip HTML tags and decode entities
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase() || '';
        const skills = searchParams.get('skills')?.toLowerCase() || '';

        // Check cache
        const now = Date.now();
        if (cachedJobs.length === 0 || now - cacheTime > CACHE_DURATION) {
            cachedJobs = await fetchRemoteOKJobs();
            cacheTime = now;
        }

        let jobs = [...cachedJobs];

        // Filter by search
        if (search) {
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(search) ||
                job.poster.name.toLowerCase().includes(search) ||
                job.description.toLowerCase().includes(search)
            );
        }

        // Filter by skills
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim());
            jobs = jobs.filter(job =>
                skillList.some(skill =>
                    job.requiredSkills.some(js => js.toLowerCase().includes(skill))
                )
            );
        }

        return NextResponse.json({
            success: true,
            jobs,
            source: 'remoteok',
            cached: now - cacheTime < CACHE_DURATION,
        });
    } catch (error: any) {
        console.error('External jobs error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
