'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';

const SKILL_SUGGESTIONS = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
    'GraphQL', 'Next.js', 'Solidity', 'Web3', 'Machine Learning',
];

export default function CreateJobPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { address, isConnected, connect, isCorrectNetwork, switchNetwork, payPlatformFee } = useWeb3();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        description: '',
        requiredSkills: [] as string[],
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        location: '',
        locationType: 'remote',
        tags: [] as string[],
    });
    const [newSkill, setNewSkill] = useState('');
    const [newTag, setNewTag] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'paying' | 'paid' | 'error'>('idle');
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const handleAddSkill = (skill: string) => {
        if (skill && !form.requiredSkills.includes(skill)) {
            setForm({ ...form, requiredSkills: [...form.requiredSkills, skill] });
            setNewSkill('');
        }
    };

    const handleAddTag = () => {
        if (newTag && !form.tags.includes(newTag)) {
            setForm({ ...form, tags: [...form.tags, newTag] });
            setNewTag('');
        }
    };

    const handlePayment = async () => {
        if (!isConnected) {
            await connect();
            return;
        }

        if (!isCorrectNetwork) {
            await switchNetwork();
            return;
        }

        setPaymentStatus('paying');
        try {
            const result = await payPlatformFee();
            if (result.success && result.txHash) {
                setTxHash(result.txHash);
                setPaymentStatus('paid');
            } else {
                setError(result.error || 'Payment failed');
                setPaymentStatus('error');
            }
        } catch (err) {
            setPaymentStatus('error');
            setError('Payment failed');
        }
    };

    const handleSubmit = async () => {
        if (!token || !txHash) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    budget: { min: parseInt(form.budgetMin) || 0, max: parseInt(form.budgetMax) || 0, currency: form.currency },
                    paymentTxHash: txHash,
                }),
            });

            const data = await res.json();
            if (data.success) {
                router.push(`/jobs/${data.job._id}`);
            } else {
                setError(data.error || 'Failed to create job');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const isStep1Valid = form.title && form.description && form.requiredSkills.length > 0;
    const isStep2Valid = form.location && form.locationType;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-[var(--cream)] mb-4">Please log in to post a job</h2>
                    <a href="/auth/login" className="btn-primary">Log in</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 relative">
            <div className="blob blob-ruby -top-48 right-20 opacity-30"></div>

            <div className="max-w-2xl mx-auto px-5 sm:px-8">
                {/* Header */}
                <div className="mb-8">
                    <span className="label">Post a Job</span>
                    <h1 className="text-[var(--cream)] text-3xl font-bold mt-2">Find your next hire</h1>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[var(--ruby)] text-white' : 'bg-[var(--charcoal)] text-[var(--ash)]'
                                }`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-[var(--ruby)]' : 'bg-[var(--charcoal)]'}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Step 1: Details */}
                {step === 1 && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-[var(--cream)] mb-6">Job Details</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="label block mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Senior React Developer"
                                />
                            </div>

                            <div>
                                <label className="label block mb-2">Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input min-h-[150px]"
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                />
                            </div>

                            <div>
                                <label className="label block mb-2">Required Skills *</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {form.requiredSkills.map((skill) => (
                                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ruby)]/15 text-[var(--ruby-soft)] text-sm">
                                            {skill}
                                            <button onClick={() => setForm({ ...form, requiredSkills: form.requiredSkills.filter(s => s !== skill) })} className="hover:text-[var(--ruby)]">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(newSkill)}
                                        className="input flex-1"
                                        placeholder="Add a skill..."
                                    />
                                    <button onClick={() => handleAddSkill(newSkill)} className="btn-secondary py-2 px-4">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {SKILL_SUGGESTIONS.filter(s => !form.requiredSkills.includes(s)).slice(0, 8).map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => handleAddSkill(skill)}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--charcoal)] text-[var(--ash)] hover:text-[var(--cream)] hover:bg-[var(--smoke)] transition-colors"
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label block mb-2">Min Budget</label>
                                    <input
                                        type="number"
                                        value={form.budgetMin}
                                        onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                                        className="input"
                                        placeholder="50000"
                                    />
                                </div>
                                <div>
                                    <label className="label block mb-2">Max Budget</label>
                                    <input
                                        type="number"
                                        value={form.budgetMax}
                                        onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                                        className="input"
                                        placeholder="80000"
                                    />
                                </div>
                                <div>
                                    <label className="label block mb-2">Currency</label>
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className="input"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="INR">INR</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button onClick={() => setStep(2)} disabled={!isStep1Valid} className="btn-primary disabled:opacity-50">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Location & Tags */}
                {step === 2 && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-[var(--cream)] mb-6">Location & Tags</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="label block mb-2">Location *</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="input"
                                    placeholder="e.g. San Francisco, CA or Worldwide"
                                />
                            </div>

                            <div>
                                <label className="label block mb-3">Work Type *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['remote', 'hybrid', 'onsite'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setForm({ ...form, locationType: type })}
                                            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${form.locationType === type
                                                    ? 'bg-[var(--ruby)] text-white'
                                                    : 'bg-[var(--charcoal)] text-[var(--ash)] hover:text-[var(--cream)]'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label block mb-2">Tags (optional)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {form.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--charcoal)] text-[var(--stone)] text-sm">
                                            {tag}
                                            <button onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })} className="hover:text-[var(--cream)]">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        className="input flex-1"
                                        placeholder="e.g. startup, funded, equity"
                                    />
                                    <button onClick={handleAddTag} className="btn-secondary py-2 px-4">Add</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                            <button onClick={() => setStep(3)} disabled={!isStep2Valid} className="btn-primary disabled:opacity-50">
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-[var(--cream)] mb-6">Pay & Publish</h2>

                        {/* Summary */}
                        <div className="p-5 rounded-xl bg-[var(--bg)] border border-[var(--charcoal)] mb-6">
                            <h3 className="font-medium text-[var(--cream)] mb-3">{form.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-[var(--ash)]">
                                <span>📍 {form.location} ({form.locationType})</span>
                                <span>💰 {form.currency} {form.budgetMin || '0'} - {form.budgetMax || '0'}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {form.requiredSkills.slice(0, 5).map((skill) => (
                                    <span key={skill} className="text-xs px-2 py-0.5 rounded bg-[var(--charcoal)] text-[var(--stone)]">{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="p-5 rounded-xl border-2 border-dashed border-[var(--charcoal)] mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[var(--cream)] font-medium">Platform Fee</span>
                                <span className="text-[var(--parrot)] font-bold">0.00001 MATIC</span>
                            </div>

                            {paymentStatus === 'idle' && (
                                <button onClick={handlePayment} className="btn-primary w-full py-3">
                                    {!isConnected ? 'Connect Wallet' : !isCorrectNetwork ? 'Switch to Polygon' : 'Pay with MetaMask'}
                                </button>
                            )}

                            {paymentStatus === 'paying' && (
                                <div className="text-center py-4">
                                    <div className="spinner mx-auto mb-2"></div>
                                    <p className="text-[var(--ash)] text-sm">Confirm in MetaMask...</p>
                                </div>
                            )}

                            {paymentStatus === 'paid' && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--parrot)]/10 text-[var(--parrot)]">
                                    <span className="text-xl">✓</span>
                                    <div>
                                        <p className="font-medium">Payment confirmed!</p>
                                        <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-80">
                                            View transaction ↗
                                        </a>
                                    </div>
                                </div>
                            )}

                            {paymentStatus === 'error' && (
                                <div className="p-4 rounded-xl bg-[var(--ruby)]/10 text-[var(--ruby-soft)] mb-4">
                                    {error || 'Payment failed'}
                                </div>
                            )}
                        </div>

                        {error && paymentStatus !== 'error' && (
                            <div className="p-4 rounded-xl bg-[var(--ruby)]/10 text-[var(--ruby-soft)] mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={paymentStatus !== 'paid' || submitting}
                                className="btn-primary disabled:opacity-50"
                            >
                                {submitting ? 'Publishing...' : 'Publish Job'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
