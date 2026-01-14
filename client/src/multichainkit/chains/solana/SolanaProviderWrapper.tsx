
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    // You can also use 'mainnet-beta'
    const testnetRPCNetwork = WalletAdapterNetwork.Testnet;

    const envNetwork: 'testnet' | 'mainnet' = import.meta.env.VITE_SOLANA_NETWORK

    //Here instead of walletAdapterNetwork mainnet, I used Solana RPC PublicNode because 
    // when used walletAdapter mainnet the RPC Server responses cors error when deployed on the domain
    const endpoint = useMemo(
        () => envNetwork === 'testnet' ? testnetRPCNetwork : `https://solana-rpc.publicnode.com`
        ,
        []
    );



    const wallets = useMemo(
        () => [new PhantomWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
