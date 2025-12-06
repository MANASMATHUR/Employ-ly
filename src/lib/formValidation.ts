// Form validation utilities with real-time feedback

import { z } from 'zod';
import { VALIDATION_LIMITS } from './constants';

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > VALIDATION_LIMITS.email.max) {
        return { isValid: false, error: `Email must be less than ${VALIDATION_LIMITS.email.max} characters` };
    }

    return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < VALIDATION_LIMITS.password.min) {
        return { isValid: false, error: `Password must be at least ${VALIDATION_LIMITS.password.min} characters` };
    }

    if (password.length > VALIDATION_LIMITS.password.max) {
        return { isValid: false, error: `Password must be less than ${VALIDATION_LIMITS.password.max} characters` };
    }

    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { isValid: true, strength };
}

/**
 * Validate name
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
    if (!name) {
        return { isValid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();
    if (trimmed.length < VALIDATION_LIMITS.name.min) {
        return { isValid: false, error: `Name must be at least ${VALIDATION_LIMITS.name.min} characters` };
    }

    if (trimmed.length > VALIDATION_LIMITS.name.max) {
        return { isValid: false, error: `Name must be less than ${VALIDATION_LIMITS.name.max} characters` };
    }

    return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string, required = false): { isValid: boolean; error?: string } {
    if (!url) {
        if (required) {
            return { isValid: false, error: 'URL is required' };
        }
        return { isValid: true };
    }

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { isValid: false, error: 'URL must use http or https protocol' };
        }
        return { isValid: true };
    } catch {
        return { isValid: false, error: 'Invalid URL format' };
    }
}

/**
 * Validate wallet address
 */
export function validateWalletAddress(address: string, required = false): { isValid: boolean; error?: string } {
    if (!address) {
        if (required) {
            return { isValid: false, error: 'Wallet address is required' };
        }
        return { isValid: true };
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return { isValid: false, error: 'Invalid Ethereum wallet address format' };
    }

    return { isValid: true };
}

/**
 * Validate transaction hash
 */
export function validateTxHash(hash: string, required = false): { isValid: boolean; error?: string } {
    if (!hash) {
        if (required) {
            return { isValid: false, error: 'Transaction hash is required' };
        }
        return { isValid: true };
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        return { isValid: false, error: 'Invalid transaction hash format' };
    }

    return { isValid: true };
}

/**
 * Validate form data against a Zod schema
 */
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
    isValid: boolean;
    data?: T;
    errors: Record<string, string>;
} {
    try {
        const parsed = schema.parse(data);
        return { isValid: true, data: parsed, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.errors.forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: { _form: 'Validation failed' } };
    }
}

/**
 * Get password strength indicator color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'var(--ruby)';
        case 'medium':
            return 'var(--gold)';
        case 'strong':
            return 'var(--parrot)';
        default:
            return 'var(--ash)';
    }
}

/**
 * Debounce function for real-time validation
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

