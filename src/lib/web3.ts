import { ethers } from 'ethers';

// Polygon Mumbai Testnet Configuration
export const POLYGON_MUMBAI_CONFIG = {
    chainId: 80001,
    chainIdHex: '0x13881',
    chainName: 'Polygon Mumbai Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://rpc-mumbai.maticvigil.com',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
    },
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
};

// Platform fee in MATIC (0.00001 MATIC = very small for testing)
export const PLATFORM_FEE = '0.00001';
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '';

interface EthereumProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: any) => void;
    removeListener: (event: string, callback: any) => void;
    isMetaMask?: boolean;
}

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { ethereum: EthereumProvider }).ethereum !== 'undefined';
}

// Get MetaMask provider
export function getProvider(): ethers.providers.Web3Provider | null {
    if (!isMetaMaskInstalled()) return null;
    return new ethers.providers.Web3Provider((window as unknown as { ethereum: any }).ethereum);
}
// Listen for account changes
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (isMetaMaskInstalled()) {
        (window as unknown as { ethereum: EthereumProvider }).ethereum.on('accountsChanged', callback);
    }
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): void {
    if (isMetaMaskInstalled()) {
        (window as unknown as { ethereum: EthereumProvider }).ethereum.on('chainChanged', callback);
    }
}

// Connect wallet and get address
export async function connectWallet(): Promise<string | null> {
    try {
        const provider = getProvider();
        if (!provider) {
            return null; // MetaMask not installed, handle gracefully
        }

        // Request account access
        const accounts = await provider.send('eth_requestAccounts', []);
        return accounts[0] || null;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        return null;
    }
}

// Switch to Polygon Mumbai network
export async function switchToPolygonMumbai(): Promise<boolean> {
    if (!isMetaMaskInstalled()) return false;

    try {
        const ethereum = (window as unknown as { ethereum: EthereumProvider }).ethereum;
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_MUMBAI_CONFIG.chainIdHex }],
        });
        return true;
    } catch (switchError: unknown) {
        // Network not added, try to add it
        const error = switchError as { code: number };
        if (error.code === 4902) {
            try {
                const ethereum = (window as unknown as { ethereum: EthereumProvider }).ethereum;
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: POLYGON_MUMBAI_CONFIG.chainIdHex,
                            chainName: POLYGON_MUMBAI_CONFIG.chainName,
                            rpcUrls: [POLYGON_MUMBAI_CONFIG.rpcUrl],
                            nativeCurrency: POLYGON_MUMBAI_CONFIG.nativeCurrency,
                            blockExplorerUrls: [POLYGON_MUMBAI_CONFIG.blockExplorerUrl],
                        },
                    ],
                });
                return true;
            } catch (addError) {
                console.error('Error adding network:', addError);
                return false;
            }
        }
        console.error('Error switching network:', switchError);
        return false;
    }
}

// Send platform fee payment
export async function sendPlatformFee(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const provider = getProvider();
        if (!provider) {
            return { success: false, error: 'MetaMask not installed' };
        }

        if (!ADMIN_WALLET) {
            return { success: false, error: 'Admin wallet not configured' };
        }

        const signer = provider.getSigner();
        // Address not needed for sending transaction from signer context


        // Ensure we're on the right network
        const network = await provider.getNetwork();
        if (network.chainId !== POLYGON_MUMBAI_CONFIG.chainId) {
            const switched = await switchToPolygonMumbai();
            if (!switched) {
                return { success: false, error: 'Please switch to Polygon Mumbai network' };
            }
        }

        // Send transaction
        const tx = await signer.sendTransaction({
            to: ADMIN_WALLET,
            value: ethers.utils.parseEther(PLATFORM_FEE),
        });

        // Wait for confirmation
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: receipt.transactionHash,
        };
    } catch (error: unknown) {
        console.error('Payment error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Transaction failed',
        };
    }
}

// Verify transaction on blockchain
export async function verifyTransaction(txHash: string): Promise<boolean> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(POLYGON_MUMBAI_CONFIG.rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);
        return receipt !== null && receipt.status === 1;
    } catch (error) {
        console.error('Error verifying transaction:', error);
        return false;
    }
}

// Get current chain ID
export async function getCurrentChainId(): Promise<number | null> {
    const provider = getProvider();
    if (!provider) return null;
    const network = await provider.getNetwork();
    return network.chainId;
}

// Verify a signed message
export function verifyMessage(message: string, signature: string): string {
    try {
        return ethers.utils.verifyMessage(message, signature);
    } catch (error) {
        console.error('Error verifying message:', error);
        return '';
    }
}
