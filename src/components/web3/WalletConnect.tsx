'use client';

import { useWeb3 } from '@/context/Web3Context';

interface WalletConnectProps {
    onConnect?: (address: string) => void;
    compact?: boolean;
}

export default function WalletConnect({ onConnect, compact = false }: WalletConnectProps) {
    const {
        address,
        isConnected,
        isCorrectNetwork,
        isMetaMaskAvailable,
        connect,
        disconnect,
        switchNetwork,
    } = useWeb3();

    const handleConnect = async () => {
        const connectedAddress = await connect();
        if (connectedAddress && onConnect) {
            onConnect(connectedAddress);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (!isMetaMaskAvailable) {
        return (
            <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${compact ? 'btn-secondary text-sm' : 'btn-primary'} flex items-center gap-2`}
            >
                <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32.958 1L19.573 11.013l2.475-5.866L32.958 1Z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Install MetaMask
            </a>
        );
    }

    if (isConnected) {
        return (
            <div className={`flex ${compact ? 'flex-row items-center gap-2' : 'flex-col gap-3'}`}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-green-400 font-medium">{formatAddress(address!)}</span>
                </div>

                {!isCorrectNetwork && (
                    <button
                        onClick={switchNetwork}
                        className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all text-sm"
                    >
                        ⚠️ Switch to Polygon Mumbai
                    </button>
                )}

                {!compact && (
                    <button
                        onClick={disconnect}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleConnect}
            className={`${compact ? 'btn-secondary text-sm' : 'btn-primary'} flex items-center gap-2`}
        >
            <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.958 1L19.573 11.013l2.475-5.866L32.958 1Z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.042 1l13.25 10.103-2.34-5.957L2.042 1Z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Connect MetaMask
        </button>
    );
}
