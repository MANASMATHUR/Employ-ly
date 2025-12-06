import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './constants';

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (!JWT_SECRET_RAW && AUTH_CONFIG.jwtSecretRequired) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env.local file.');
}

if (process.env.NODE_ENV === 'production' && JWT_SECRET_RAW && JWT_SECRET_RAW.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long for security.');
}

// Ensure JWT_SECRET is a string (required for jwt.sign)
if (!JWT_SECRET_RAW) {
    throw new Error('JWT_SECRET must be defined');
}

const JWT_SECRET: string = JWT_SECRET_RAW;

export interface JWTPayload {
    userId: string;
    email: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function createToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function getTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
    const token = getTokenFromHeader(request);
    if (!token) return null;
    return verifyToken(token);
}
