import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScrapedJob from '@/models/ScrapedJob';

interface RemoteOKJob {
    id: string;
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

// Extract skills from tags and description
function extractSkills(tags: string[], description: string): string[] {
    const commonSkills = [
        'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'nodejs', 'python',
        'java', 'go', 'golang', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
        'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'jenkins',
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
        'graphql', 'rest', 'api', 'microservices', 'serverless',
        'machine learning', 'ml', 'ai', 'data science', 'nlp',
        'figma', 'sketch', 'ui', 'ux', 'css', 'sass', 'tailwind',
        'git', 'agile', 'scrum', 'ci/cd', 'devops', 'sre',
        'solidity', 'web3', 'blockchain', 'ethereum', 'solana',
    ];

    const found = new Set<string>();

    // From tags
    tags.forEach(tag => {
        const lower = tag.toLowerCase();
        if (commonSkills.includes(lower)) {
            found.add(tag);
        }
    });

    // From description
    const descLower = description.toLowerCase();
    commonSkills.forEach(skill => {
        if (descLower.includes(skill) && !found.has(skill)) {
            found.add(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });

    return Array.from(found).slice(0, 15);
}

// Infer seniority from title
function inferSeniority(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('intern')) return 'intern';
    if (lower.includes('junior') || lower.includes('jr')) return 'junior';
    if (lower.includes('senior') || lower.includes('sr')) return 'senior';
    if (lower.includes('lead') || lower.includes('principal')) return 'lead';
    if (lower.includes('manager') || lower.includes('director')) return 'manager';
    if (lower.includes('vp') || lower.includes('chief') || lower.includes('head')) return 'executive';
    return 'mid';
}

// Infer category from tags/title
function inferCategory(title: string, tags: string[]): string {
    const text = (title + ' ' + tags.join(' ')).toLowerCase();
    if (text.match(/engineer|developer|backend|frontend|fullstack|devops|sre/)) return 'Engineering';
    if (text.match(/design|ui|ux|figma|creative/)) return 'Design';
    if (text.match(/product|pm|owner/)) return 'Product';
    if (text.match(/data|analyst|science|ml|ai/)) return 'Data';
    if (text.match(/market|growth|seo|content/)) return 'Marketing';
    if (text.match(/sales|account|business dev/)) return 'Sales';
    if (text.match(/hr|recruit|people/)) return 'HR';
    if (text.match(/finance|account|cfo/)) return 'Finance';
    return 'Other';
}

// Clean HTML from description
function cleanDescription(html: string): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

// POST: Sync jobs from RemoteOK to database
export async function POST(request: NextRequest) {
    try {
        // Skip auth in development, require in production
        const isDev = process.env.NODE_ENV !== 'production';
        if (!isDev) {
            const authHeader = request.headers.get('x-admin-key');
            if (authHeader !== (process.env.ADMIN_SYNC_KEY || 'sync-secret')) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        await connectDB();

        // Fetch from RemoteOK
        const res = await fetch('https://remoteok.com/api', {
            headers: { 'User-Agent': 'Employly Job Sync' },
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
        }

        const data = await res.json();
        const jobs: RemoteOKJob[] = Array.isArray(data) ? data.slice(1) : [];

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const job of jobs) {
            const sourceId = `remoteok-${job.id}`;
            const cleanDesc = cleanDescription(job.description);
            const skills = extractSkills(job.tags || [], cleanDesc);

            const jobData = {
                sourceId,
                source: 'remoteok',
                sourceUrl: job.url,
                title: job.position,
                company: job.company,
                companyLogo: job.company_logo || undefined,
                descriptionRaw: job.description,
                descriptionClean: cleanDesc,
                requirements: {
                    skills,
                    experience: undefined,
                    education: undefined,
                    languages: ['English'],
                },
                salary: {
                    min: job.salary_min || undefined,
                    max: job.salary_max || undefined,
                    currency: 'USD',
                    period: 'annual' as const,
                },
                location: job.location || 'Remote',
                locationType: 'remote' as const,
                tags: job.tags?.slice(0, 10) || [],
                seniority: inferSeniority(job.position),
                category: inferCategory(job.position, job.tags || []),
                postedAt: new Date(job.date),
                scrapedAt: new Date(),
            };

            try {
                const existing = await ScrapedJob.findOne({ sourceId });
                if (existing) {
                    await ScrapedJob.updateOne({ sourceId }, { $set: { ...jobData, updatedAt: new Date() } });
                    updated++;
                } else {
                    await ScrapedJob.create(jobData);
                    created++;
                }
            } catch {
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            stats: { created, updated, skipped, total: jobs.length },
        });
    } catch (error: unknown) {
        console.error('Sync error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// GET: Retrieve scraped jobs with filters (for training data export)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const skip = parseInt(searchParams.get('skip') || '0');
        const category = searchParams.get('category');
        const seniority = searchParams.get('seniority');
        const format = searchParams.get('format') || 'json';

        const query: Record<string, any> = { 'labels.isValid': { $ne: false } };
        if (category) query.category = category;
        if (seniority) query.seniority = seniority;

        const jobs = await ScrapedJob.find(query)
            .select('-__v')
            .sort({ scrapedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await ScrapedJob.countDocuments(query);

        // CSV format for ML training
        if (format === 'csv') {
            const headers = ['title', 'company', 'skills', 'seniority', 'category', 'salary_min', 'salary_max', 'description'];
            const rows = jobs.map(j => [
                `"${j.title?.replace(/"/g, '""')}"`,
                `"${j.company?.replace(/"/g, '""')}"`,
                `"${j.requirements?.skills?.join(', ') || ''}"`,
                j.seniority || '',
                j.category || '',
                j.salary?.min || '',
                j.salary?.max || '',
                `"${(j.descriptionClean || '').slice(0, 500).replace(/"/g, '""')}"`,
            ].join(','));

            const csv = [headers.join(','), ...rows].join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="jobs_training_data.csv"',
                },
            });
        }

        return NextResponse.json({
            success: true,
            jobs,
            pagination: { total, skip, limit, hasMore: skip + limit < total },
        });
    } catch (error: unknown) {
        console.error('Get scraped jobs error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
