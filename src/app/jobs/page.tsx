'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import JobCard from '@/components/jobs/JobCard';
import ExternalJobCard from '@/components/jobs/ExternalJobCard';

interface Job {
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
}

interface ExternalJob extends Job {
    source: 'external';
    externalUrl: string;
    companyLogo?: string;
}

export default function JobsPage() {
    const { token } = useAuth();
    const [tab, setTab] = useState<'all' | 'posted' | 'live'>('all');
    const [internalJobs, setInternalJobs] = useState<Job[]>([]);
    const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);

            // Fetch both in parallel
            const [internalRes, externalRes] = await Promise.all([
                fetch('/api/jobs', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }),
                fetch('/api/jobs/external'),
            ]);

            const [internalData, externalData] = await Promise.all([
                internalRes.json(),
                externalRes.json(),
            ]);

            if (internalData.success) setInternalJobs(internalData.jobs);
            if (externalData.success) setExternalJobs(externalData.jobs);

            setLoading(false);
        };

        fetchJobs();
    }, [token]);

    // Filter jobs by search
    const filteredInternal = internalJobs.filter(j =>
        !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredExternal = externalJobs.filter(j =>
        !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    const showInternal = tab === 'all' || tab === 'posted';
    const showExternal = tab === 'all' || tab === 'live';

    return (
        <div className="min-h-screen py-10 relative">
            <div className="blob blob-ruby -top-48 -left-32 opacity-40"></div>

            <div className="max-w-5xl mx-auto px-5 sm:px-8">
                {/* Header */}
                <div className="mb-8">
                    <span className="label">Open Roles</span>
                    <h1 className="text-[var(--cream)] text-3xl sm:text-4xl font-bold mt-2 mb-3">
                        Find your next role
                    </h1>
                    <p className="text-[var(--ash)]">
                        Browse platform jobs and live openings from around the web.
                    </p>
                </div>

                {/* Search + Tabs */}
                <div className="card mb-8 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by title or skill..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input flex-1"
                        />
                        <div className="flex gap-2">
                            {[
                                { id: 'all', label: 'All', count: filteredInternal.length + filteredExternal.length },
                                { id: 'posted', label: 'Platform', count: filteredInternal.length },
                                { id: 'live', label: 'Live Jobs', count: filteredExternal.length },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id as typeof tab)}
                                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${tab === t.id
                                            ? 'bg-[var(--ruby)] text-white'
                                            : 'bg-[var(--charcoal)] text-[var(--ash)] hover:text-[var(--cream)]'
                                        }`}
                                >
                                    {t.label}
                                    <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-white/70' : 'text-[var(--smoke)]'}`}>
                                        {t.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* External jobs (live) */}
                        {showExternal && filteredExternal.length > 0 && (
                            <>
                                {tab === 'all' && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[var(--parrot)] animate-pulse"></span>
                                            <span className="text-sm font-medium text-[var(--cream)]">Live from RemoteOK</span>
                                        </div>
                                        <div className="flex-1 h-px bg-[var(--charcoal)]"></div>
                                    </div>
                                )}
                                {filteredExternal.map((job) => (
                                    <ExternalJobCard key={job._id} job={job} />
                                ))}
                            </>
                        )}

                        {/* Internal jobs (platform) */}
                        {showInternal && filteredInternal.length > 0 && (
                            <>
                                {tab === 'all' && filteredExternal.length > 0 && (
                                    <div className="flex items-center gap-3 mb-4 mt-8">
                                        <span className="text-sm font-medium text-[var(--cream)]">Platform Jobs</span>
                                        <div className="flex-1 h-px bg-[var(--charcoal)]"></div>
                                    </div>
                                )}
                                {filteredInternal.map((job) => (
                                    <JobCard key={job._id} job={job} showMatchScore={!!token} />
                                ))}
                            </>
                        )}

                        {/* Empty state */}
                        {filteredInternal.length === 0 && filteredExternal.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-4xl mb-4 opacity-30">🔍</div>
                                <h3 className="text-lg font-semibold text-[var(--cream)] mb-2">No jobs found</h3>
                                <p className="text-[var(--ash)]">Try a different search term</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
