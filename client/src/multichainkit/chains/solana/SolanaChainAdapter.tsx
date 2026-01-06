
import React, { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getSolanaBalance } from './solanaBalance';
import { useAuthActions } from '@/store/useAuthStore';
import { ChainContext } from '../../context/ChainContext';
import type { ChainType, ChainAdapter } from '../../context/ChainContext';
import { useGiftActions } from '@/store';

interface SolanaChainAdapterProps {
    children: React.ReactNode;
    chain: ChainType;
    setChain: (chain: ChainType) => void;
    switchChain: (chain: ChainType) => void;
}

export const SolanaChainAdapter: React.FC<SolanaChainAdapterProps> = ({
    children,
    chain,
    setChain,
    switchChain
}) => {
    const { connection } = useConnection();
    const {
        wallet,
        connect,
        disconnect,
        publicKey,
        sendTransaction,
        signMessage
    } = useWallet();

    const { disconnectWallet: disconnectAuthWallet } = useAuthActions();
    const { emptyGiftStats } = useGiftActions();

    const disconnectWallet = async () => {
        try {
            await disconnect();
            emptyGiftStats();
        } catch (e) {
            console.error(e);
        }
        await disconnectAuthWallet();
    };

    const getBalance = async (address: string): Promise<string> => {
        if (!address) return "0";
        return getSolanaBalance(connection, address);
    };

    // Implement connectWallet wrapper
    const connectWallet = () => {
        if (wallet && !wallet.adapter.connected) {
            connect().catch(console.error);
        }
    };

    const activeAdapter = useMemo<ChainAdapter | null>(() => {
        return {
            type: 'solana',
            connection,
            publicKey,
            sendTransaction,
            signMessage
        };
    }, [connection, publicKey, sendTransaction, signMessage]);

    const address = useMemo(() => {
        return publicKey?.toBase58() || null;
    }, [publicKey]);

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
