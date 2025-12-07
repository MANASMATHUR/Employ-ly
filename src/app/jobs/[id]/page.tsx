'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import MatchScore from '@/components/ai/MatchScore';
import InterviewPrep from '@/components/ai/InterviewPrep';

interface Job {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    budget: { min: number; max: number; currency: string };
    location: string;
    locationType: string;
    tags: string[];
    poster: { _id: string; name: string; bio?: string; avatarUrl?: string; skills?: string[]; linkedinUrl?: string };
    paymentTxHash: string;
    status: string;
    applicants: Array<{ _id: string; name: string; avatarUrl?: string; skills?: string[] }>;
    views: number;
    createdAt: string;
    matchData?: {
        score: number;
        matchedSkills: string[];
        missingSkills: string[];
        recommendation: string;
    };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, token } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`/api/jobs/${id}`, { headers });
                const data = await res.json();

                if (data.success) {
                    setJob(data.job);
                    if (user && data.job.applicants) {
                        setApplied(data.job.applicants.some((a: any) => a._id === user.id));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, token, user]);

    const handleApply = async () => {
        if (!token) { router.push('/auth/login'); return; }
        setApplying(true);
        try {
            const res = await fetch(`/api/jobs/${id}/apply`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setApplied(true);
            else alert(data.error);
        } catch (err) {
            console.error(err);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--cream)] mb-4">Job not found</h2>
                    <Link href="/jobs" className="btn-primary">Back to jobs</Link>
                </div>
            </div>
        );
    }

    const formatBudget = () => {
        if (job.budget.min === 0 && job.budget.max === 0) return 'Negotiable';
        if (job.budget.min === job.budget.max) return `${job.budget.currency} ${job.budget.min.toLocaleString()}`;
        return `${job.budget.currency} ${job.budget.min.toLocaleString()}–${job.budget.max.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen py-10 relative">
            <div className="blob blob-ruby -top-48 -right-32 opacity-30"></div>

            <div className="max-w-5xl mx-auto px-5 sm:px-8">
                {/* Back */}
                <Link href="/jobs" className="inline-flex items-center gap-2 text-[var(--ash)] hover:text-[var(--cream)] mb-8 text-sm transition-colors">
                    ← Back to jobs
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Header */}
                        <div className="card">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cream)] mb-3">{job.title}</h1>
                                    <div className="flex items-center gap-3 text-[var(--ash)] text-sm">
                                        <span className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-[10px] text-white font-medium">
                                                {job.poster.name.charAt(0)}
                                            </span>
                                            {job.poster.name}
                                        </span>
                                        <span className="text-[var(--smoke)]">·</span>
                                        <span>{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-lg ${job.status === 'active' ? 'bg-[var(--parrot)]/15 text-[var(--parrot)]' : 'bg-[var(--charcoal)] text-[var(--ash)]'}`}>
                                    {job.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--stone)]">
                                <span className="flex items-center gap-2">
                                    <span className="text-[var(--parrot)]">$</span>
                                    {formatBudget()}
                                </span>
                                <span className="flex items-center gap-2">
                                    📍 {job.location} · {job.locationType}
                                </span>
                                <span className="flex items-center gap-2">
                                    👁 {job.views} views
                                </span>
                                <span className="flex items-center gap-2">
                                    👥 {job.applicants.length} applied
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--cream)] mb-3 uppercase tracking-wide">About this role</h3>
                                <p className="text-[var(--stone)] whitespace-pre-wrap leading-relaxed">{job.description}</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card">
                            <h3 className="text-sm font-semibold text-[var(--cream)] mb-4 uppercase tracking-wide">Required skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill) => (
                                    <span key={skill} className="tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Interview Prep - THE STANDOUT FEATURE */}
                        <InterviewPrep jobId={job._id} jobTitle={job.title} token={token} />

                        {/* Blockchain verification */}
                        {job.paymentTxHash && (
                            <div className="card p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-[var(--parrot)]/15 flex items-center justify-center text-[var(--parrot)]">⛓</span>
                                        <div>
                                            <h3 className="font-medium text-[var(--cream)]">Verified on-chain</h3>
                                            <p className="text-xs text-[var(--ash)]">Payment confirmed on Polygon</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://mumbai.polygonscan.com/tx/${job.paymentTxHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[var(--ruby-soft)] hover:text-[var(--ruby)] transition-colors"
                                    >
                                        View tx →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Apply */}
                        <div className="card">
                            {applied ? (
                                <div className="text-center py-4">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--parrot)]/15 flex items-center justify-center text-[var(--parrot)] text-2xl">✓</div>
                                    <h3 className="font-semibold text-[var(--cream)] mb-1">Applied!</h3>
                                    <p className="text-[var(--ash)] text-sm">They&apos;ll review your profile</p>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleApply}
                                        disabled={applying || job.status !== 'active'}
                                        className="btn-primary w-full py-3.5 disabled:opacity-50"
                                    >
                                        {applying ? 'Applying...' : 'Apply now'}
                                    </button>
                                    {!token && (
                                        <p className="text-center text-[var(--ash)] text-xs mt-3">
                                            <Link href="/auth/login" className="text-[var(--ruby-soft)] hover:underline">Log in</Link> to apply
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Match Score */}
                        {job.matchData && (
                            <MatchScore
                                score={job.matchData.score}
                                recommendation={job.matchData.recommendation}
                                matchedSkills={job.matchData.matchedSkills}
                                missingSkills={job.matchData.missingSkills}
                                showDetails={true}
                            />
                        )}

                        {/* Poster */}
                        <div className="card">
                            <h3 className="label mb-4">Posted by</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-white font-semibold">
                                    {job.poster.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-[var(--cream)]">{job.poster.name}</h4>
                                    {job.poster.linkedinUrl && (
                                        <a href={job.poster.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--ruby-soft)] hover:underline">
                                            LinkedIn ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                            {job.poster.bio && (
                                <p className="text-[var(--ash)] text-sm">{job.poster.bio}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
