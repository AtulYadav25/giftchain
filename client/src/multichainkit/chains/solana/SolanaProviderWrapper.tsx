
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    // You can also use 'mainnet-beta'
    // const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(
        () => `https://solana-rpc.publicnode.com`,
        []
    );

    // https://mainnet.helius-rpc.com/?api-key=c87d92e9-3b4e-4c58-9f70-ac683af109eb


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
