'use client';

import Link from 'next/link';
import MatchScore from '@/components/ai/MatchScore';

interface JobCardProps {
    job: {
        _id: string;
        title: string;
        description: string;
        requiredSkills: string[];
        budget: { min: number; max: number; currency: string };
        location: string;
        locationType: string;
        tags: string[];
        poster: { name: string; avatarUrl?: string };
        matchScore?: number;
        matchRecommendation?: string;
        createdAt: string;
        views?: number;
        applicants?: string[];
    };
    showMatchScore?: boolean;
}

export default function JobCard({ job, showMatchScore = true }: JobCardProps) {
    const formatBudget = () => {
        if (job.budget.min === 0 && job.budget.max === 0) return 'Negotiable';
        if (job.budget.min === job.budget.max) return `${job.budget.currency} ${job.budget.min.toLocaleString()}`;
        return `${job.budget.currency} ${job.budget.min.toLocaleString()}–${job.budget.max.toLocaleString()}`;
    };

    const timeAgo = (date: string) => {
        const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Link href={`/jobs/${job._id}`}>
            <div className="card group cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-[var(--cream)] group-hover:text-[var(--ruby-soft)] transition-colors truncate">
                                {job.title}
                            </h3>
                            <span className="hidden sm:block text-xs px-3 py-1 rounded-lg bg-[var(--parrot)]/10 text-[var(--parrot)] font-medium whitespace-nowrap">
                                {formatBudget()}
                            </span>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-[var(--ash)] mb-4">
                            <span className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-[10px] text-white font-medium">
                                    {job.poster.name.charAt(0)}
                                </span>
                                {job.poster.name}
                            </span>
                            <span className="text-[var(--smoke)]">·</span>
                            <span>{timeAgo(job.createdAt)}</span>
                            <span className="text-[var(--smoke)]">·</span>
                            <span className="capitalize">{job.locationType}</span>
                        </div>

                        {/* Description */}
                        <p className="text-[var(--stone)] text-sm line-clamp-2 mb-4">
                            {job.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5">
                            {job.requiredSkills.slice(0, 4).map((skill) => (
                                <span key={skill} className="tag text-xs py-1 px-2">{skill}</span>
                            ))}
                            {job.requiredSkills.length > 4 && (
                                <span className="text-xs text-[var(--smoke)] py-1">+{job.requiredSkills.length - 4}</span>
                            )}
                        </div>
                    </div>

                    {/* Match score */}
                    {showMatchScore && job.matchScore !== undefined && (
                        <div className="sm:w-24 flex-shrink-0 pt-2 sm:pt-0">
                            <MatchScore score={job.matchScore} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
