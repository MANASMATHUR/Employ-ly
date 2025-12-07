'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/jobs');
        } else {
            setError(result.error || 'Something went wrong');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-16 relative">
            {/* Blobs */}
            <div className="blob blob-ruby -top-48 left-10 opacity-50"></div>
            <div className="blob blob-green -bottom-32 right-10 opacity-40"></div>

            <div className="relative w-full max-w-sm">
                <div className="card glass-strong p-8 sm:p-10">
                    {/* Logo */}
                    <Link href="/" className="flex justify-center mb-10">
                        <Image
                            src="/logo.png"
                            alt="Employly"
                            width={160}
                            height={45}
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-[var(--cream)] mb-2">Welcome back</h1>
                        <p className="text-[var(--ash)] text-sm">Log in to keep building</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--ruby)]/10 border border-[var(--ruby)]/20 text-[var(--ruby-soft)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label block mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[var(--ash)] text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-[var(--ruby-soft)] hover:text-[var(--ruby)] font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
