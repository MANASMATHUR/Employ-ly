'use client';

import Link from 'next/link';

interface ExternalJobCardProps {
    job: {
        _id: string;
        title: string;
        description: string;
        requiredSkills: string[];
        budget: { min: number; max: number; currency: string };
        location: string;
        locationType: string;
        poster: { name: string; avatarUrl?: string };
        createdAt: string;
        externalUrl: string;
        companyLogo?: string;
    };
}

export default function ExternalJobCard({ job }: ExternalJobCardProps) {
    const formatBudget = () => {
        if (job.budget.min === 0 && job.budget.max === 0) return null;
        if (job.budget.min === job.budget.max) return `$${(job.budget.min / 1000).toFixed(0)}k`;
        return `$${(job.budget.min / 1000).toFixed(0)}k–${(job.budget.max / 1000).toFixed(0)}k`;
    };

    const timeAgo = (date: string) => {
        const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const budget = formatBudget();

    return (
        <a href={job.externalUrl} target="_blank" rel="noopener noreferrer">
            <div className="card group cursor-pointer">
                <div className="flex items-start gap-4">
                    {/* Company logo */}
                    {job.companyLogo ? (
                        <img
                            src={job.companyLogo}
                            alt={job.poster.name}
                            className="w-12 h-12 rounded-xl object-cover bg-[var(--charcoal)] flex-shrink-0"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-white font-bold flex-shrink-0">
                            {job.poster.name.charAt(0)}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-base font-semibold text-[var(--cream)] group-hover:text-[var(--ruby-soft)] transition-colors line-clamp-1">
                                {job.title}
                            </h3>
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[var(--charcoal)] text-[var(--ash)] flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--parrot)]"></span>
                                Live
                            </span>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-[var(--ash)] mb-3">
                            <span className="font-medium text-[var(--stone)]">{job.poster.name}</span>
                            <span className="text-[var(--smoke)]">·</span>
                            <span>{timeAgo(job.createdAt)}</span>
                            <span className="text-[var(--smoke)]">·</span>
                            <span>{job.location}</span>
                            {budget && (
                                <>
                                    <span className="text-[var(--smoke)]">·</span>
                                    <span className="text-[var(--parrot)]">{budget}</span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-[var(--ash)] text-sm line-clamp-2 mb-3">
                            {job.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5">
                            {job.requiredSkills.slice(0, 4).map((skill) => (
                                <span key={skill} className="text-[10px] py-0.5 px-2 rounded bg-[var(--charcoal)] text-[var(--stone)]">
                                    {skill}
                                </span>
                            ))}
                            {job.requiredSkills.length > 4 && (
                                <span className="text-[10px] text-[var(--smoke)]">+{job.requiredSkills.length - 4}</span>
                            )}
                        </div>
                    </div>

                    {/* External link icon */}
                    <div className="text-[var(--smoke)] group-hover:text-[var(--ruby-soft)] transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    );
}
