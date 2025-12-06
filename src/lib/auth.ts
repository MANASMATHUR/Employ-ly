import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './constants';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && AUTH_CONFIG.jwtSecretRequired) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env.local file.');
}

if (JWT_SECRET && JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long for security.');
}

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
