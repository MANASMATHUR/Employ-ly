'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { address, isConnected, connect, isCorrectNetwork, switchNetwork, isMetaMaskAvailable } = useWeb3();
    const [mobileOpen, setMobileOpen] = useState(false);

    const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <nav className="glass-strong fixed top-0 left-0 right-0 z-50">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logo.png"
                            alt="Employly"
                            width={140}
                            height={40}
                            className="h-9 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-7">
                        <Link href="/jobs" className="text-[var(--ash)] hover:text-[var(--cream)] transition-colors font-medium text-sm">
                            Jobs
                        </Link>
                        <Link href="/feed" className="text-[var(--ash)] hover:text-[var(--cream)] transition-colors font-medium text-sm">
                            Community
                        </Link>
                        {user && (
                            <Link href="/jobs/create" className="text-[var(--ash)] hover:text-[var(--parrot)] transition-colors font-medium text-sm">
                                Post job
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Wallet */}
                        {isConnected ? (
                            <div className="flex items-center gap-2">
                                {!isCorrectNetwork && (
                                    <button onClick={switchNetwork} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 font-medium hover:bg-[var(--gold)]/15 transition-colors">
                                        Wrong network
                                    </button>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--parrot)]/10 border border-[var(--parrot)]/15">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--parrot)]"></div>
                                    <span className="text-xs text-[var(--parrot)] font-mono">{shortAddr(address!)}</span>
                                </div>
                            </div>
                        ) : isMetaMaskAvailable ? (
                            <button onClick={connect} className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl bg-[var(--parrot)]/10 text-[var(--parrot)] border border-[var(--parrot)]/20 hover:bg-[var(--parrot)]/20 transition-colors font-medium">
                                <span>🦊</span>
                                Connect Wallet
                            </button>
                        ) : (
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-colors font-medium"
                            >
                                <span>🦊</span>
                                Install MetaMask
                            </a>
                        )}

                        {/* Auth */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-2 group">
                                    <div className="avatar-ring">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold">{user.name.charAt(0)}</span>
                                        </div>
                                    </div>
                                    <span className="text-[var(--stone)] text-sm group-hover:text-[var(--cream)] transition-colors">{user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={logout} className="text-[var(--smoke)] hover:text-[var(--ruby)] transition-colors p-1.5" title="Log out">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="text-sm text-[var(--ash)] hover:text-[var(--cream)] transition-colors font-medium px-3 py-2">
                                    Log in
                                </Link>
                                <Link href="/auth/register" className="btn-primary text-xs py-2 px-4">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[var(--ash)] hover:text-[var(--cream)]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--charcoal)]">
                        <div className="flex flex-col gap-3">
                            <Link href="/jobs" className="text-[var(--stone)] hover:text-[var(--cream)] py-2 font-medium">Jobs</Link>
                            <Link href="/feed" className="text-[var(--stone)] hover:text-[var(--cream)] py-2 font-medium">Community</Link>
                            {user ? (
                                <>
                                    <Link href="/jobs/create" className="text-[var(--stone)] hover:text-[var(--cream)] py-2 font-medium">Post job</Link>
                                    <Link href="/profile" className="text-[var(--stone)] hover:text-[var(--cream)] py-2 font-medium">Profile</Link>
                                    <button onClick={logout} className="text-left text-[var(--ash)] hover:text-[var(--ruby)] py-2 font-medium">Log out</button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-2">
                                    <Link href="/auth/login" className="btn-secondary text-center">Log in</Link>
                                    <Link href="/auth/register" className="btn-primary text-center">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
