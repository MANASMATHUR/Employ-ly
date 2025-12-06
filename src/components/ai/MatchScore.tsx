'use client';

interface MatchScoreProps {
    score: number;
    recommendation?: string;
    matchedSkills?: string[];
    missingSkills?: string[];
    showDetails?: boolean;
}

export default function MatchScore({
    score,
    recommendation,
    matchedSkills = [],
    missingSkills = [],
    showDetails = false,
}: MatchScoreProps) {
    const color = score >= 80 ? 'var(--parrot)' : score >= 60 ? 'var(--gold)' : score >= 40 ? 'var(--coral)' : 'var(--ruby)';
    const label = score >= 80 ? 'Great fit' : score >= 60 ? 'Good fit' : score >= 40 ? 'Partial' : 'Low match';

    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className={showDetails ? 'card' : ''}>
            <div className="flex items-center gap-4">
                {/* Ring */}
                <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--charcoal)" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r="36" fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
                    </div>
                </div>

                {/* Label */}
                {(recommendation || !showDetails) && (
                    <div className="flex-1">
                        <p className="font-medium" style={{ color }}>{label}</p>
                        {recommendation && <p className="text-[var(--ash)] text-xs mt-0.5">{recommendation}</p>}
                    </div>
                )}
            </div>

            {/* Skill breakdown */}
            {showDetails && (matchedSkills.length > 0 || missingSkills.length > 0) && (
                <div className="mt-5 pt-5 border-t border-[var(--charcoal)]">
                    {matchedSkills.length > 0 && (
                        <div className="mb-4">
                            <span className="label text-[var(--parrot)] mb-2 block">You have</span>
                            <div className="flex flex-wrap gap-1.5">
                                {matchedSkills.map((s) => (
                                    <span key={s} className="tag-green text-xs py-1 px-2">✓ {s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {missingSkills.length > 0 && (
                        <div>
                            <span className="label text-[var(--coral)] mb-2 block">To learn</span>
                            <div className="flex flex-wrap gap-1.5">
                                {missingSkills.map((s) => (
                                    <span key={s} className="tag text-xs py-1 px-2">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
