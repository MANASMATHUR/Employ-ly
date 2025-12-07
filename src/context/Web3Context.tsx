'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    connectWallet,
    switchToPolygonMumbai,
    sendPlatformFee,
    isMetaMaskInstalled,
    getCurrentChainId,
    onAccountsChanged,
    onChainChanged,
    POLYGON_MUMBAI_CONFIG,
    PLATFORM_FEE,
} from '@/lib/web3';

interface Web3ContextType {
    address: string | null;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    isMetaMaskAvailable: boolean;
    chainId: number | null;
    connect: () => Promise<string | null>;
    disconnect: () => void;
    switchNetwork: () => Promise<boolean>;
    payPlatformFee: () => Promise<{ success: boolean; txHash?: string; error?: string }>;
    platformFee: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

    const isConnected = !!address;
    const isCorrectNetwork = chainId === POLYGON_MUMBAI_CONFIG.chainId;

    useEffect(() => {
        const checkMetaMask = isMetaMaskInstalled();
        if (checkMetaMask !== isMetaMaskAvailable) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMetaMaskAvailable(checkMetaMask);
        }

        // Check for existing connection
        const checkConnection = async () => {
            if (checkMetaMask) {
                try {
                    const ethereum = (window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
                    if (ethereum) {
                        const accounts = await ethereum.request({ method: 'eth_accounts' });
                        if (accounts.length > 0) {
                            setAddress(accounts[0]);
                        }
                        const currentChainId = await getCurrentChainId();
                        setChainId(currentChainId);
                    }
                } catch (error) {
                    console.error('Error checking connection:', error);
                }
            }
        };

        checkConnection();

        // Set up listeners
        if (checkMetaMask) {
            onAccountsChanged((accounts: string[]) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                } else {
                    setAddress(null);
                }
            });

            onChainChanged((chainIdHex: string) => {
                setChainId(parseInt(chainIdHex, 16));
            });
        }
    }, [isMetaMaskAvailable]);

    const connect = useCallback(async () => {
        const connectedAddress = await connectWallet();
        if (connectedAddress) {
            setAddress(connectedAddress);
            const currentChainId = await getCurrentChainId();
            setChainId(currentChainId);
        }
        return connectedAddress;
    }, []);

    const disconnect = useCallback(() => {
        setAddress(null);
    }, []);

    const switchNetwork = useCallback(async () => {
        const switched = await switchToPolygonMumbai();
        if (switched) {
            setChainId(POLYGON_MUMBAI_CONFIG.chainId);
        }
        return switched;
    }, []);

    const payPlatformFee = useCallback(async () => {
        if (!isConnected) {
            return { success: false, error: 'Wallet not connected' };
        }
        if (!isCorrectNetwork) {
            const switched = await switchNetwork();
            if (!switched) {
                return { success: false, error: 'Please switch to Polygon Mumbai network' };
            }
        }
        return sendPlatformFee();
    }, [isConnected, isCorrectNetwork, switchNetwork]);

    return (
        <Web3Context.Provider
            value={{
                address,
                isConnected,
                isCorrectNetwork,
                isMetaMaskAvailable,
                chainId,
                connect,
                disconnect,
                switchNetwork,
                payPlatformFee,
                platformFee: PLATFORM_FEE,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}

export function useWeb3() {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}
