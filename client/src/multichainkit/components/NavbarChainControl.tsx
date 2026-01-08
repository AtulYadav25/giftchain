

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
                    <span className={`text-sm font-bold ${chain === "solana" ? "text-purple-100" : "text-blue-100"} uppercase`}>
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

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// ... (Logos are defined above)

const MobileConnectButton = () => {
    const { chain, switchChain } = useChain();
    const { setVisible } = useWalletModal();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 text-sm md:text-base outline-none"
                >
                    <Wallet size={18} />
                    Connect Wallet
                </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[90%] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Choose Network</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-6">
                    {/* Solana Option */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (chain !== 'solana') switchChain('solana');
                            else setVisible(true);
                        }}
                        className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all ${chain === 'solana'
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 ring-offset-1'
                            : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50'
                            }`}
                    >
                        <SolanaLogo size={48} />
                        <span className="font-bold text-slate-700">Solana</span>
                        {chain === 'solana' && <span className="text-[10px] font-bold text-white bg-purple-500 px-2 py-0.5 rounded-full">Active</span>}
                    </motion.div>

                    {/* Sui Option */}
                    {chain === 'sui' ? (
                        <ConnectModal
                            trigger={
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all border-blue-500 bg-blue-50 ring-2 ring-blue-200 ring-offset-1"
                                >
                                    <SuiLogo size={48} />
                                    <span className="font-bold text-slate-700">Sui</span>
                                    <span className="text-[10px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">Active</span>
                                </motion.div>
                            }
                        />
                    ) : (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => switchChain('sui')}
                            className="w-full cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                        >
                            <SuiLogo size={48} />
                            <span className="font-bold text-slate-700">Sui</span>
                        </motion.div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ChainConnectButton = () => {
    const { chain } = useChain();
    const { setVisible } = useWalletModal();

    return (
        <>
            {/* Desktop: Direct Buttons */}
            <div className="hidden md:block">
                {chain === 'sui' ? (
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
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVisible(true)}
                        className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 text-sm md:text-base"
                    >
                        <Wallet size={18} />
                        Connect Wallet
                    </motion.button>
                )}
            </div>

            {/* Mobile: Selection Dialog */}
            <div className="md:hidden">
                <MobileConnectButton />
            </div>
        </>
    );
};
