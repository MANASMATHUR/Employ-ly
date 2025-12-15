'use client';

import { useState } from 'react';

export default function AdminSyncPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);

    const syncJobs = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/jobs/sync', {
                method: 'POST',
                headers: { 'x-admin-key': 'sync-secret' },
            });
            const data = await res.json();
            setResult(data);
            setStatus(data.success ? 'success' : 'error');

            if (data.success) {
                // Fetch the synced jobs
                const jobsRes = await fetch('/api/jobs/sync?limit=20');
                const jobsData = await jobsRes.json();
                if (jobsData.success) setJobs(jobsData.jobs);
            }
        } catch (err: any) {
            setResult({ error: err.message });
            setStatus('error');
        }
    };

    const exportCSV = () => {
        window.open('/api/jobs/sync?format=csv&limit=1000', '_blank');
    };

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-5 sm:px-8">
                <div className="mb-8">
                    <span className="label">Admin</span>
                    <h1 className="text-[var(--cream)] text-3xl font-bold mt-2 mb-3">
                        Job Data Sync
                    </h1>
                    <p className="text-[var(--ash)]">
                        Sync jobs from external sources into the database for ML training.
                    </p>
                </div>

                {/* Actions */}
                <div className="card mb-8 p-6">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={syncJobs}
                            disabled={status === 'loading'}
                            className="btn-primary disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Syncing...' : ' Sync from RemoteOK'}
                        </button>
                        <button onClick={exportCSV} className="btn-secondary">
                             Export CSV (Training Data)
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`mt-6 p-4 rounded-xl ${status === 'success' ? 'bg-[var(--parrot)]/10 text-[var(--parrot)]' : 'bg-[var(--ruby)]/10 text-[var(--ruby-soft)]'}`}>
                            {status === 'success' ? (
                                <div>
                                    <p className="font-medium mb-2"> Sync complete!</p>
                                    <div className="text-sm opacity-80">
                                        <span>Created: {result.stats?.created}</span>
                                        <span className="mx-2">•</span>
                                        <span>Updated: {result.stats?.updated}</span>
                                        <span className="mx-2">•</span>
                                        <span>Total: {result.stats?.total}</span>
                                    </div>
                                </div>
                            ) : (
                                <p> {result.error || 'Sync failed'}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview */}
                {jobs.length > 0 && (
                    <div className="card">
                        <h3 className="text-[var(--cream)] font-semibold mb-4">
                            Synced Jobs Preview ({jobs.length})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {jobs.map((job: any) => (
                                <div key={job._id} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--charcoal)]">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-[var(--cream)] font-medium">{job.title}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--charcoal)] text-[var(--ash)]">
                                            {job.seniority}
                                        </span>
                                    </div>
                                    <p className="text-[var(--ash)] text-sm mb-2">{job.company}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {job.requirements?.skills?.slice(0, 5).map((skill: string) => (
                                            <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-[var(--ruby)]/10 text-[var(--ruby-soft)]">
                                                {skill}
                                            </span>
                                        ))}
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--parrot)]/10 text-[var(--parrot)]">
                                            {job.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schema info */}
                <div className="card mt-8 p-6">
                    <h3 className="text-[var(--cream)] font-semibold mb-4">Data Schema (for ML)</h3>
                    <pre className="text-xs text-[var(--ash)] bg-[var(--bg)] p-4 rounded-xl overflow-x-auto">
                        {`{
  title: "Senior React Developer",
  company: "TechCorp",
  requirements: {
    skills: ["React", "TypeScript", "Node.js"],
    experience: "5+ years",
    languages: ["English"]
  },
  salary: { min: 120000, max: 180000, currency: "USD" },
  seniority: "senior",
  category: "Engineering",
  tags: ["react", "typescript", "remote"],
  descriptionClean: "We're looking for..."
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
