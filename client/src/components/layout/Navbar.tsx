import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Gift, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthActions } from "@/store";
import toast from "react-hot-toast";
import { useChain } from "@/multichainkit/context/ChainContext";
import { ChainSwitcher, ChainConnectButton } from "@/multichainkit/components/NavbarChainControl";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Multi-chain hooks
    const { address, disconnectWallet, chain } = useChain();
    const { disconnectWallet: disconnectAuth } = useAuthActions();

    const isConnected = !!address;
    const isHome = location.pathname === '/';

    // Scroll detection for glass effect intensity
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDisconnect = async () => {
        try {
            await disconnectAuth();
            disconnectWallet();
        } catch (err: any) {
            toast.error(err.message || "Failed to disconnect wallet");
        }
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${!isHome
                ? "bg-pink-600 py-3 shadow-lg" // Solid blue for other pages
                : scrolled
                    ? "bg-[#2e9aff]/80 backdrop-blur-xl border-b border-white/20 py-3 shadow-lg shadow-blue-500/10" // Tinted glass on scroll
                    : "bg-transparent py-5" // Transparent at top of home
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-2">
                    <span className="font-['Lilita_One'] text-2xl md:text-3xl text-white drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                        GiftChain<span className={`text-blue-200 ${!isHome
                            ? "text-pink-100" // Solid blue for other pages
                            : scrolled
                                ? "text-blue-200" // Tinted glass on scroll
                                : "text-blue-200" // Transparent at top of home
                            }`}>.fun</span>
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4">

                    {/* Chain Switcher */}
                    <ChainSwitcher />

                    {!isConnected ? (
                        <ChainConnectButton />

                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 md:pl-4 md:pr-2 rounded-full border border-white/20 transition-all cursor-pointer"
                                >
                                    <div className="hidden md:flex flex-col items-end mr-2">
                                        <span className="text-xs font-bold text-white/90">
                                            {address?.slice(0, 4)}...{address?.slice(-4)}
                                        </span>
                                        <span className={`text-[10px] font-jua px-1.5 rounded-full ${chain === 'solana' ? 'bg-purple-500/20 text-purple-200' : 'bg-blue-500/20 text-blue-200'}`}>
                                            {chain === 'solana' ? 'Solana Mainnet' : 'Sui Network'}
                                        </span>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-white/30">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">GC</AvatarFallback>
                                    </Avatar>
                                    <ChevronDown size={14} className="text-white/70" />
                                </motion.div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-blue-100 rounded-2xl shadow-xl p-2 mt-2">
                                <DropdownMenuLabel className="text-blue-900 px-3 py-2">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-blue-50" />

                                <DropdownMenuItem
                                    className="cursor-pointer rounded-xl focus:bg-blue-50 focus:text-blue-700 py-2.5 px-3 mb-1"
                                    onClick={() => navigate('/profile')}
                                >
                                    <User size={16} className="mr-2" />
                                    My Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="cursor-pointer rounded-xl focus:bg-blue-50 focus:text-blue-700 py-2.5 px-3 mb-1"
                                    onClick={() => navigate('/profile')}
                                >
                                    <Gift size={16} className="mr-2" />
                                    My Gifts
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-blue-50" />

                                <DropdownMenuItem
                                    onClick={handleDisconnect}
                                    className="cursor-pointer rounded-xl focus:bg-red-50 text-red-500 focus:text-red-600 py-2.5 px-3"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Disconnect
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
