
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction, useDisconnectWallet, useSignPersonalMessage } from '@mysten/dapp-kit';
import { getSolanaBalance } from '../chains/solana/solanaBalance';
import { getSuiBalance } from '../chains/sui/suiBalance';
import { useAuthActions } from '@/store/useAuthStore'

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

interface ChainContextType {
    chain: ChainType;
    setChain: (chain: ChainType) => void;
    switchChain: (chain: ChainType) => void;
    connectWallet: () => void;

    disconnectWallet: () => void;
    getBalance: (address: string) => Promise<string>;
    activeAdapter: ChainAdapter | null;
    address: string | null;
}

const ChainContext = createContext<ChainContextType>({
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

export const ChainContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [chain, setChain] = useState<ChainType>(() => {
        const saved = localStorage.getItem('giftchain_network');
        return (saved === 'solana' || saved === 'sui') ? saved : 'solana';
    });

    const { disconnectWallet: disconnectAuthWallet } = useAuthActions();

    // Solana
    const { connection } = useConnection();
    const {
        wallet: solanaWallet,
        connect: connectSolana,
        disconnect: disconnectSolana,
        publicKey: solanaPublicKey,
        sendTransaction: sendSolanaTransaction,
        signMessage: signSolanaMessage
    } = useWallet();

    // Sui
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteSui } = useSignAndExecuteTransaction();
    const { mutateAsync: signPersonalMessageSui } = useSignPersonalMessage();
    const { mutate: disconnectSui } = useDisconnectWallet();
    const currentSuiAccount = useCurrentAccount();

    const connectWallet = () => {
        if (chain === 'solana') {
            if (solanaWallet && !solanaWallet.adapter.connected) {
                // This typically requires the WalletMultiButton if the user hasn't selected a wallet yet
                // But if they have, this might work. 
                connectSolana().catch(console.error);
            }
        } else if (chain === 'sui') {
            // Sui connect is usually handled by the UI ConnectButton which triggers the modal

        }
    };

    const disconnectWallet = () => {
        // Disconnects everything found just to be safe & clean
        disconnectSolana().catch(console.error);
        disconnectSui();
    };

    const switchChain = async (newChain: ChainType) => {
        if (!newChain) return;

        await disconnectAuthWallet();
        // Disconnect ALL wallets from ALL chains
        disconnectWallet();

        // Update state and storage
        setChain(newChain);
        localStorage.setItem('giftchain_network', newChain);
    };

    const getBalance = async (address: string): Promise<string> => {
        if (!address) return "0";
        if (chain === 'solana') {
            return getSolanaBalance(connection, address);
        } else if (chain === 'sui') {
            return getSuiBalance(suiClient, address);
        }
        return "0";
    };

    const activeAdapter = useMemo<ChainAdapter | null>(() => {
        if (chain === 'solana') {
            return {
                type: 'solana',
                connection,
                publicKey: solanaPublicKey,
                sendTransaction: sendSolanaTransaction,
                signMessage: signSolanaMessage
            };
        } else if (chain === 'sui') {
            return {
                type: 'sui',
                client: suiClient,
                account: currentSuiAccount,
                signAndExecute: signAndExecuteSui,
                signPersonalMessage: signPersonalMessageSui
            };
        }
        return null;
    }, [chain, connection, solanaPublicKey, sendSolanaTransaction, signSolanaMessage, suiClient, currentSuiAccount, signAndExecuteSui, signPersonalMessageSui]);

    const address = useMemo(() => {
        if (chain === 'solana') return solanaPublicKey?.toBase58() || null;
        if (chain === 'sui') return currentSuiAccount?.address || null;
        return null;
    }, [chain, solanaPublicKey, currentSuiAccount]);

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

