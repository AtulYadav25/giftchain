
import React from 'react';
import { useChain, type ChainType } from '../context/ChainContext';

export const ChainSelector = () => {
    const { chain, setChain } = useChain();

    const handleSelect = (c: ChainType) => {
        setChain(c);
    };

    return (
        <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg shadow-sm w-full max-w-md mx-auto bg-white">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Select Network
            </h2>
            <div className="flex gap-4">
                <button
                    onClick={() => handleSelect('solana')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${chain === 'solana'
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Solana
                </button>
                <button
                    onClick={() => handleSelect('sui')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${chain === 'sui'
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Sui
                </button>
            </div>
            {chain && (
                <div className="text-center text-sm text-gray-500 animate-fade-in">
                    Active Chain: <span className="font-bold uppercase">{chain}</span>
                </div>
            )}
        </div>
    );
};
