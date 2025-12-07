'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    bio: string;
    skills: string[];
    walletAddress: string;
    linkedinUrl: string;
    avatarUrl: string;
    isRecruiter: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount (only on client side)
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                fetchUser(storedToken);
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            if (res.ok && data.success && data.user) {
                setUser(data.user);
                setToken(authToken);
            } else {
                // Token is invalid or expired
                console.warn('Auth token validation failed:', data.error || 'Unknown error');
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // On network error, clear auth state
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success && data.token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', data.token);
                }
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }

            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (res.ok && data.success && data.token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', data.token);
                }
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }

            return { success: false, error: data.error || 'Registration failed' };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const refreshUser = async () => {
        if (token) {
            await fetchUser(token);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, token, isLoading, login, register, logout, updateUser, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
