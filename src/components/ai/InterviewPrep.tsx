'use client';

import { useState } from 'react';

interface Question {
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    tip: string;
}

interface InterviewPrepProps {
    jobId: string;
    jobTitle: string;
    token: string | null;
}

export default function InterviewPrep({ jobId, jobTitle, token }: InterviewPrepProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<number | null>(null);

    const typeColors: Record<string, { bg: string; text: string; label: string }> = {
        technical: { bg: 'bg-[var(--ruby)]/10', text: 'text-[var(--ruby-soft)]', label: 'Technical' },
        behavioral: { bg: 'bg-[var(--parrot)]/10', text: 'text-[var(--parrot)]', label: 'Behavioral' },
        situational: { bg: 'bg-[var(--gold)]/10', text: 'text-[var(--gold)]', label: 'Situational' },
    };

    const generateQuestions = async () => {
        if (!token) {
            setError('Log in to use Interview Prep');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/jobs/${jobId}/interview-prep`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.success) {
                setQuestions(data.questions);
            } else {
                setError(data.error || 'Failed to generate questions');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (questions.length === 0) {
        return (
            <div className="card p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--ruby)] to-[var(--gold)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎯</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--cream)] mb-1">Interview Prep</h3>
                        <p className="text-[var(--ash)] text-sm mb-4">
                            Get AI-generated interview questions tailored to this role and your skills.
                        </p>
                        {error && <p className="text-[var(--coral)] text-sm mb-3">{error}</p>}
                        <button
                            onClick={generateQuestions}
                            disabled={loading}
                            className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Questions'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ruby)] to-[var(--gold)] flex items-center justify-center">
                        <span className="text-lg">🎯</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--cream)]">Interview Prep</h3>
                        <p className="text-xs text-[var(--ash)]">{questions.length} questions ready</p>
                    </div>
                </div>
                <button
                    onClick={generateQuestions}
                    className="text-xs text-[var(--ash)] hover:text-[var(--cream)] transition-colors"
                >
                    ↻ Regenerate
                </button>
            </div>

            <div className="space-y-3">
                {questions.map((q, i) => {
                    const colors = typeColors[q.type];
                    const isOpen = expanded === i;

                    return (
                        <div
                            key={i}
                            className={`rounded-xl border transition-all cursor-pointer ${isOpen
                                    ? 'border-[var(--ruby)]/30 bg-[var(--bg-raised)]'
                                    : 'border-[var(--charcoal)] hover:border-[var(--smoke)]'
                                }`}
                            onClick={() => setExpanded(isOpen ? null : i)}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-[var(--ash)] text-sm font-medium w-5 flex-shrink-0">
                                        {i + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                                {colors.label}
                                            </span>
                                        </div>
                                        <p className="text-[var(--cream)] text-sm leading-relaxed">{q.question}</p>
                                    </div>
                                    <span className={`text-[var(--ash)] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                        ↓
                                    </span>
                                </div>

                                {isOpen && (
                                    <div className="mt-4 ml-8 pt-3 border-t border-[var(--charcoal)]">
                                        <div className="flex items-start gap-2">
                                            <span className="text-[var(--gold)]">💡</span>
                                            <p className="text-[var(--ash)] text-sm">{q.tip}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-[var(--smoke)] mt-4 text-center">
                Questions personalized based on job requirements + your profile
            </p>
        </div>
    );
}
