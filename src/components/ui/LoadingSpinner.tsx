'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`spinner ${sizeClasses[size]} border-[var(--charcoal)] border-t-[var(--ruby)] rounded-full`}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p className="text-[var(--ash)] text-sm font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}

export function LoadingOverlay({ text }: { text?: string }) {
    return (
        <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingSpinner size="lg" text={text || 'Loading...'} />
        </div>
    );
}

export function InlineLoader({ text }: { text?: string }) {
    return (
        <div className="flex items-center gap-2 py-4">
            <LoadingSpinner size="sm" />
            {text && <span className="text-[var(--ash)] text-sm">{text}</span>}
        </div>
    );
}

