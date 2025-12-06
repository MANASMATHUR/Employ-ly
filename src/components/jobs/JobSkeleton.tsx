'use client';

export default function JobSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="flex items-start gap-4">
                {/* Avatar skeleton */}
                <div className="skeleton skeleton-avatar flex-shrink-0"></div>

                <div className="flex-1">
                    {/* Title */}
                    <div className="skeleton skeleton-title mb-3"></div>

                    {/* Meta line */}
                    <div className="flex gap-3 mb-4">
                        <div className="skeleton h-3 w-20"></div>
                        <div className="skeleton h-3 w-16"></div>
                        <div className="skeleton h-3 w-24"></div>
                    </div>

                    {/* Description lines */}
                    <div className="skeleton skeleton-text w-full"></div>
                    <div className="skeleton skeleton-text w-4/5"></div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-4">
                        <div className="skeleton h-6 w-16 rounded-lg"></div>
                        <div className="skeleton h-6 w-20 rounded-lg"></div>
                        <div className="skeleton h-6 w-14 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function JobListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <JobSkeleton key={i} />
            ))}
        </div>
    );
}
