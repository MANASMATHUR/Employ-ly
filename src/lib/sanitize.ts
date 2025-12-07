// Input sanitization utilities to prevent XSS attacks

/**
 * Sanitize HTML content by removing potentially dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';


    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');


    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');


    sanitized = sanitized.replace(/javascript:/gi, '');


    sanitized = sanitized.replace(/data:text\/html/gi, '');

    return sanitized.trim();
}

/**
 * Sanitize plain text by removing HTML tags
 */
export function sanitizeText(text: string): string {
    if (!text) return '';


    return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string, maxLength?: number): string {
    if (!input) return '';

    let sanitized = input.trim();


    sanitized = sanitized.replace(/\0/g, '');


    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');


    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Sanitize wallet address
 */
export function sanitizeWalletAddress(address: string): string {
    if (!address) return '';


    const sanitized = address.trim().toLowerCase();


    if (!/^0x[a-f0-9]{40}$/.test(sanitized)) {
        return '';
    }

    return sanitized;
}

/**
 * Sanitize transaction hash
 */
export function sanitizeTxHash(hash: string): string {
    if (!hash) return '';

    const sanitized = hash.trim().toLowerCase();


    if (!/^0x[a-f0-9]{64}$/.test(sanitized)) {
        return '';
    }

    return sanitized;
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(arr: string[], maxLength?: number): string[] {
    if (!Array.isArray(arr)) return [];

    return arr
        .map(item => sanitizeInput(String(item), maxLength))
        .filter(item => item.length > 0);
}

