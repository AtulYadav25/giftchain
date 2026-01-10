
import { useChain } from '../context/ChainContext';
import { Transaction } from '../core/Transaction';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ConnectButton } from '@mysten/dapp-kit';
import { useState } from 'react';

export const WalletActions = () => {
    const { chain, address, getBalance, activeAdapter } = useChain();
    const [balance, setBalance] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');

    if (!chain) return null;

    const handleFetchBalance = async () => {
        if (!address) return;
        setStatus('Fetching balance...');
        try {
            const bal = await getBalance(address);
            setBalance(bal);
            setStatus('Balance fetched');
        } catch (e) {
            setStatus('Error fetching balance');
        }
    };

    const handleSendTestTx = async () => {
        if (!activeAdapter) {
            setStatus("Please connect wallet first");
            return;
        }

        setStatus("Building transaction...");

        try {
            // Requirement: "Create a manually written class... Transaction must internally decide"
            // Requirement examples use: const tx = new Transaction(activeChain)
            const tx = new Transaction(activeAdapter);

            // Bundling multiple transfers as per requirements
            // Using small amounts (lamports/mist) for safety in test
            // Solana: 0.001 SOL, Sui: 0.01 SUI (approx)
            // Addresses are dummy ones for demonstration or self-send if preferred
            // We will send to self if address is available, or a burnt address
            const target = address;

            if (!target) {
                setStatus("No address to send to");
                return;
            }

            // Example: send twice
            tx.sendCoins(0.000001, target); // Tiny amount to self
            tx.sendCoins(0.000002, target);

            setStatus("Please sign the transaction...");
            const txId = await tx.signAndExecute();

            setStatus(`Success! Tx: ${txId?.slice(0, 10)}...`);
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    const handleSignMessage = async () => {
        if (!activeAdapter) {
            setStatus("Please connect wallet first");
            return;
        }

        setStatus("Signing message...");

        try {
            const tx = new Transaction(activeAdapter);
            const signature = await tx.signMessage("Hello from MultiX!");

            setStatus(`Message Signed! Sig: ${signature?.slice(0, 10)}... (Check Console)`);
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 border border-gray-200 rounded-lg shadow-sm w-full max-w-md mx-auto bg-white mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Wallet Actions for {chain.toUpperCase()}</h3>

            {/* Wallet Connection UI */}
            <div className="flex justify-center">
                {chain === 'solana' && <WalletMultiButton />}
                {chain === 'sui' && <ConnectButton />}
            </div>

            {/* Address Display */}
            {address && (
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 break-all text-center">
                    {address}
                </div>
            )}

            {/* Actions (Only if connected) */}
            {address && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                        <span className="text-gray-700 font-medium">Balance:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700">{balance !== null ? balance : '---'}</span>
                            <button
                                onClick={handleFetchBalance}
                                className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded text-blue-800"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSendTestTx}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow hover:opacity-90 transition-all active:scale-95"
                    >
                        Test Bundled Transaction
                    </button>

                    <button
                        onClick={handleSignMessage}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow hover:opacity-90 transition-all active:scale-95"
                    >
                        Sign Message
                    </button>

                    {status && (
                        <p className="text-center text-sm text-gray-500 mt-2">{status}</p>
                    )}
                </div>
            )}
        </div>
    );
};
