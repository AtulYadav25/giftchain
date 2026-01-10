import { useAuthActions, useGiftActions } from '@/store';
import GiftchainLoader from '../../components/GiftchainLoader';
import React, { createContext, useContext, useState } from 'react';

export type ChainType = 'solana' | 'sui' | null;

export interface ChainAdapter {
    type: ChainType;
    // Solana specific
    connection?: any;
    sendTransaction?: any;
    publicKey?: any;
    signMessage?: any;
    // Sui specific
    client?: any;
    signAndExecute?: any;
    signPersonalMessage?: any;
    account?: any;
}

export interface ChainContextType {
    chain: ChainType;
    setChain: (chain: ChainType) => void;
    switchChain: (chain: ChainType) => void;
    connectWallet: () => void;

    disconnectWallet: () => void;
    getBalance: (address: string) => Promise<string>;
    activeAdapter: ChainAdapter | null;
    address: string | null;
}

export const ChainContext = createContext<ChainContextType>({
    chain: 'solana',
    setChain: () => { },
    switchChain: () => { },
    connectWallet: () => { },

    disconnectWallet: () => { },
    getBalance: async () => "0",
    activeAdapter: null,
    address: null,
});

export const useChain = () => useContext(ChainContext);


// Lazy load providers
const SolanaProviderWrapper = React.lazy(() => import('../chains/solana/SolanaProviderWrapper').then(module => ({ default: module.SolanaProviderWrapper })));
const SuiProviderWrapper = React.lazy(() => import('../chains/sui/SuiProviderWrapper').then(module => ({ default: module.SuiProviderWrapper })));

// Lazy load adapters
const SolanaChainAdapter = React.lazy(() => import('../chains/solana/SolanaChainAdapter').then(module => ({ default: module.SolanaChainAdapter })));
const SuiChainAdapter = React.lazy(() => import('../chains/sui/SuiChainAdapter').then(module => ({ default: module.SuiChainAdapter })));

export const ChainContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [chain, setChain] = useState<ChainType>(() => {
        const saved = localStorage.getItem('giftchain_network');
        return (saved === 'solana' || saved === 'sui') ? saved : 'solana';
    });

    const { disconnectWallet } = useAuthActions();
    const { emptyGiftStats } = useGiftActions();

    const switchChain = async (newChain: ChainType) => {
        if (!newChain || newChain === chain) return;

        // Note: Disconnecting the previous wallet is handled by the fact that the provider unmounts.
        // However, if we need to explicitly clear state, we effectively do so by switching context.
        // The new provider will start fresh.
        // If we want to ensure disconnect happens, we rely on the specific adapter's unmount behavior or disconnect before switch.
        // Since we can't access the other context here, we just switch.

        await disconnectWallet(); //API Calling Disconnect
        emptyGiftStats();
        setChain(newChain);
        localStorage.setItem('giftchain_network', newChain);
    };

    return (
        // TODO : Add Custom Loading Screen
        <React.Suspense fallback={<GiftchainLoader />}>
            {chain === 'solana' && (
                <SolanaProviderWrapper>
                    <SolanaChainAdapter chain={chain} setChain={setChain} switchChain={switchChain}>
                        {children}
                    </SolanaChainAdapter>
                </SolanaProviderWrapper>
            )}

            {chain === 'sui' && (
                <SuiProviderWrapper>
                    <SuiChainAdapter chain={chain} setChain={setChain} switchChain={switchChain}>
                        {children}
                    </SuiChainAdapter>
                </SuiProviderWrapper>
            )}

            {!chain && children}
        </React.Suspense>
    );
};

