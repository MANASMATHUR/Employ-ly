'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Web3Provider } from '@/context/Web3Context';
import { ToastProvider } from '@/lib/toast';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <AuthProvider>
                <Web3Provider>
                    {children}
                </Web3Provider>
            </AuthProvider>
        </ToastProvider>
    );
}
