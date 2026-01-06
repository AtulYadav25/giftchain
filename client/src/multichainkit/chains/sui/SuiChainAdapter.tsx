
import React, { useMemo } from 'react';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction, useDisconnectWallet, useSignPersonalMessage } from '@mysten/dapp-kit';
import { getSuiBalance } from './suiBalance';
import { useAuthActions } from '@/store/useAuthStore';
import { ChainContext } from '../../context/ChainContext';
import type { ChainType, ChainAdapter } from '../../context/ChainContext';
import { useGiftActions } from '@/store';

interface SuiChainAdapterProps {
    children: React.ReactNode;
    chain: ChainType;
    setChain: (chain: ChainType) => void;
    switchChain: (chain: ChainType) => void;
}

export const SuiChainAdapter: React.FC<SuiChainAdapterProps> = ({
    children,
    chain,
    setChain,
    switchChain
}) => {
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteSui } = useSignAndExecuteTransaction();
    const { mutateAsync: signPersonalMessageSui } = useSignPersonalMessage();
    const { mutate: disconnectSui } = useDisconnectWallet();
    const currentSuiAccount = useCurrentAccount();

    const { disconnectWallet: disconnectAuthWallet } = useAuthActions();
    const { emptyGiftStats } = useGiftActions();

    const disconnectWallet = async () => {
        disconnectSui();
        await disconnectAuthWallet();
        emptyGiftStats();
    };

    const getBalance = async (address: string): Promise<string> => {
        if (!address) return "0";
        return getSuiBalance(suiClient, address);
    };

    const connectWallet = () => {
        // Sui connect is handled by UI components usually
    };

    const activeAdapter = useMemo<ChainAdapter | null>(() => {
        return {
            type: 'sui',
            client: suiClient,
            account: currentSuiAccount,
            signAndExecute: signAndExecuteSui,
            signPersonalMessage: signPersonalMessageSui
        };
    }, [suiClient, currentSuiAccount, signAndExecuteSui, signPersonalMessageSui]);

    const address = useMemo(() => {
        return currentSuiAccount?.address || null;
    }, [currentSuiAccount]);

    return (
        <ChainContext.Provider value={{
            chain,
            setChain,
            switchChain,
            connectWallet,
            disconnectWallet,
            getBalance,
            activeAdapter,
            address
        }}>
            {children}
        </ChainContext.Provider>
    );
};
