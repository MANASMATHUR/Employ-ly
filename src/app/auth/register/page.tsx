'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords don\'t match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password needs to be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register(formData.email, formData.password, formData.name);

        if (result.success) {
            router.push('/profile');
        } else {
            setError(result.error || 'Something went wrong');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-16 relative">
            {/* Blobs */}
            <div className="blob blob-ruby -top-32 right-20 opacity-50"></div>
            <div className="blob blob-green -bottom-48 left-10 opacity-40"></div>

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
                        <h1 className="text-2xl font-bold text-[var(--cream)] mb-2">Create your account</h1>
                        <p className="text-[var(--ash)] text-sm">Takes about 30 seconds</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--ruby)]/10 border border-[var(--ruby)]/20 text-[var(--ruby-soft)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label block mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                placeholder="What should we call you?"
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="6+ characters"
                                required
                            />
                        </div>

                        <div>
                            <label className="label block mb-2">Confirm password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="One more time"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[var(--ash)] text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-[var(--ruby-soft)] hover:text-[var(--ruby)] font-medium transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
