'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { getProvider } from '@/lib/web3';

export default function ProfilePage() {
    const { user, token, updateUser } = useAuth();
    const { address, isConnected, connect } = useWeb3();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        bio: '',
        skills: [] as string[],
        linkedinUrl: '',
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                bio: user.bio || '',
                skills: user.skills || [],
                linkedinUrl: user.linkedinUrl || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            // Prepare body
            const body: Record<string, unknown> = { ...form };

            // If linking a new wallet (address exists and is different from current saved one), ask for signature
            if (address && address !== user?.walletAddress) {
                try {
                    const provider = getProvider();
                    if (provider) {
                        const signer = provider.getSigner();
                        const message = `Sign this message to verify ownership of wallet ${address} for Employly. Timestamp: ${Date.now()}`;
                        const signature = await signer.signMessage(message);
                        body.walletAddress = address;
                        body.signature = signature;
                        body.message = message;
                    }
                } catch (error) {
                    console.error("Signing failed", error);

                }
            } else if (address) {
                body.walletAddress = address;
            }

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                updateUser(data.user);
                setEditing(false);
            } else {
                alert(`Save failed: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const extractSkills = async () => {
        if (!form.bio || !token) return;
        setExtracting(true);
        try {
            const res = await fetch('/api/profile/extract-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: form.bio }),
            });
            const data = await res.json();
            if (data.success && data.skills) {
                setForm({ ...form, skills: [...new Set([...form.skills, ...data.skills])] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setExtracting(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
            setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
    };

    const profileCompletion = () => {
        let score = 0;
        if (form.name) score += 20;
        if (form.bio && form.bio.length > 50) score += 25;
        if (form.skills.length >= 3) score += 25;
        if (form.linkedinUrl) score += 15;
        if (address) score += 15;
        return score;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-[var(--cream)] mb-4">Please log in</h2>
                    <Link href="/auth/login" className="btn-primary">Log in</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 relative">
            <div className="blob blob-ruby -top-48 right-20 opacity-5"></div>
            <div className="blob blob-green -bottom-32 -left-20 opacity-5"></div>

            <div className="max-w-3xl mx-auto px-5 sm:px-8">
                {/* Profile Header */}
                <div className="card mb-6 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center text-white text-2xl font-bold">
                                {form.name.charAt(0) || 'U'}
                            </div>
                            {/* Connected Indicator
                            {isConnected && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--parrot)] flex items-center justify-center border-2 border-[var(--bg-card)]">
                                    <span className="text-[10px]">⚡</span>
                                </div>
                            )}
                            */}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--cream)]">{form.name || 'Your Name'}</h1>
                                    <p className="text-[var(--ash)] text-sm">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="btn-secondary text-sm py-2 px-4"
                                >
                                    {editing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            {/* Wallet */}
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-[var(--parrot)]/10 text-[var(--parrot)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--parrot)]"></span>
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </span>
                                ) : (
                                    <button onClick={connect} className="text-sm text-[var(--ash)] hover:text-[var(--ruby-soft)] transition-colors">
                                        + Connect wallet
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Completion */}
                    <div className="mt-6 pt-6 border-t border-[var(--charcoal)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--ash)]">Profile completion</span>
                            <span className="text-sm font-medium text-[var(--cream)]">{profileCompletion()}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${profileCompletion()}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Stats - Hidden until real data is available
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="stat-card">
                        <div className="stat-value">12</div>
                        <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">89</div>
                        <div className="stat-label">Profile Views</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">78%</div>
                        <div className="stat-label">Avg Match</div>
                    </div>
                </div>
                */}

                {/* Bio Section */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-[var(--cream)] mb-4 flex items-center gap-2">
                        About
                        {editing && (
                            <button onClick={extractSkills} disabled={extracting} className="text-xs px-3 py-1 rounded-lg bg-[var(--ruby)]/15 text-[var(--ruby-soft)] hover:bg-[var(--ruby)]/25 transition-colors disabled:opacity-50">
                                {extracting ? 'Extracting...' : ' Extract skills with AI'}
                            </button>
                        )}
                    </h2>
                    {editing ? (
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            className="input min-h-[120px]"
                            placeholder="Tell us about yourself, your experience, what you're looking for..."
                        />
                    ) : (
                        <p className="text-[var(--stone)] leading-relaxed">
                            {form.bio || 'Add a bio to help recruiters understand who you are and what you\'re looking for.'}
                        </p>
                    )}
                </div>

                {/* Skills Section */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-[var(--cream)] mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {form.skills.length === 0 ? (
                            <p className="text-[var(--ash)] text-sm">No skills added yet</p>
                        ) : (
                            form.skills.map((skill) => (
                                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ruby)]/10 text-[var(--ruby-soft)] text-sm">
                                    {skill}
                                    {editing && (
                                        <button onClick={() => removeSkill(skill)} className="hover:text-[var(--ruby)] transition-colors">×</button>
                                    )}
                                </span>
                            ))
                        )}
                    </div>
                    {editing && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                className="input flex-1"
                                placeholder="Add a skill..."
                            />
                            <button onClick={addSkill} className="btn-secondary py-2 px-4">Add</button>
                        </div>
                    )}
                </div>

                {/* LinkedIn */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-[var(--cream)] mb-4">LinkedIn</h2>
                    {editing ? (
                        <input
                            type="url"
                            value={form.linkedinUrl}
                            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                            className="input"
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                    ) : form.linkedinUrl ? (
                        <a href={form.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--ruby-soft)] hover:underline">
                            {form.linkedinUrl}
                        </a>
                    ) : (
                        <p className="text-[var(--ash)] text-sm">Not connected</p>
                    )}
                </div>

                {/* Save Button */}
                {editing && (
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
