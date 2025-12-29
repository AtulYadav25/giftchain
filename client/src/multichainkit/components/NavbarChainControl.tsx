

import { useChain } from '../context/ChainContext';
import { ConnectModal } from '@mysten/dapp-kit';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Logos
const SolanaLogo = ({ size = 20 }: { size?: number }) => (
    <img
        src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
        alt="SOL"
        style={{ width: size, height: size, borderRadius: '50%' }}
    />
);

const SuiLogo = ({ size = 20 }: { size?: number }) => (
    <img
        src="https://assets.coingecko.com/coins/images/26375/standard/sui_asset.jpeg"
        alt="SUI"
        style={{ width: size, height: size, borderRadius: '50%' }}
    />
);

export const ChainSwitcher = () => {
    const { chain, switchChain } = useChain();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer ${chain === 'solana'
                        ? 'bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 hover:bg-white/20'
                        : 'bg-blue-500/10 hover:bg-blue-500/20'
                        } backdrop-blur-md`}
                >
                    {chain === 'solana' ? <SolanaLogo size={20} /> : <SuiLogo size={20} />}
                    <span className={`text-sm font-bold ${chain === "solana" ? "text-purple-100" : "text-blue-100"} hidden md:block uppercase`}>
                        {chain}
                    </span>
                    <ChevronDown size={14} className="text-white/70" />
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-blue-100 rounded-xl shadow-xl p-1 mt-2 min-w-[140px]">
                <DropdownMenuItem
                    onClick={() => switchChain('solana')}
                    className={`cursor-pointer gap-3  py-2 ${chain === 'solana' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}
                >
                    <SolanaLogo size={18} />
                    <span>Solana</span>
                    {chain === 'solana' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => switchChain('sui')}
                    className={`cursor-pointer gap-3  py-2 ${chain === 'sui' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                    <SuiLogo size={18} />
                    <span>Sui</span>
                    {chain === 'sui' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const ChainConnectButton = () => {
    const { chain } = useChain();
    const { setVisible } = useWalletModal();

    if (chain === 'sui') {
        return (
            <ConnectModal
                trigger={
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 text-sm md:text-base"
                    >
                        <Wallet size={18} />
                        Connect Wallet
                    </motion.button>
                }
            />

        );
    }

    if (chain === 'solana') {
        return (

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisible(true)}
                className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 text-sm md:text-base"
            >
                <Wallet size={18} />
                Connect Wallet
            </motion.button>
        );
    }

    return null;
};
