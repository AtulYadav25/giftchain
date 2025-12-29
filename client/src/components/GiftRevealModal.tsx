import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import confetti from 'canvas-confetti';
// @ts-ignore
import { toPng } from 'html-to-image';
import {
    X,
    Download,
    ExternalLink,
    Copy,
    Gift as GiftIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Gift } from '@/types/gift.types';
import toast from 'react-hot-toast';

import { useGiftActions } from '@/store/useGiftStore';
import { useChain } from '@/multichainkit/context/ChainContext';

interface GiftRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    gift: Gift;
    variant: 'sent' | 'received';
}

export default function GiftRevealModal({ isOpen, onClose, gift, variant }: GiftRevealModalProps) {
    const [isClaimed, setIsClaimed] = useState(gift.status === 'opened');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { address } = useChain();

    const modalRef = useRef<HTMLDivElement>(null);
    const { claimGiftSubmit } = useGiftActions();

    useEffect(() => {
        setIsClaimed(gift.status === 'opened');
    }, [gift, isOpen]);

    useEffect(() => {
        if (isOpen) {
            triggerConfetti();
        }
    }, [isOpen]);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        handleClaim();
    };

    const handleClaim = async () => {
        if (isProcessing || isClaimed || address === gift.senderWallet) return;

        setIsProcessing(true);
        const toastId = toast.loading("Initiating claim...");

        try {
            await claimGiftSubmit(gift._id);

            setIsClaimed(true);
            toast.success("Gift Claimed Successfully!", { id: toastId, icon: '🎉' });

        } catch (err: any) {
            toast.error(err.message || "Failed to claim gift", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };


    const handleDownload = async () => {
        if (!modalRef.current) return;
        setIsDownloading(true);
        const toastId = toast.loading("Capturing image...");

        try {
            // Adding a small delay to ensure any images/fonts are rendered
            await new Promise((resolve) => setTimeout(resolve, 500));

            const dataUrl = await toPng(modalRef.current, {
                cacheBust: true,
                backgroundColor: 'transparent',
                pixelRatio: 2,
                filter: (node) => {
                    // Exclude elements with this class
                    if (node.classList?.contains('exclude-from-capture')) {
                        return false;
                    }
                    return true;
                }
            });

            const link = document.createElement('a');
            link.download = `giftchain-${gift._id}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Image downloaded!", { id: toastId });
        } catch (err) {
            toast.error("Could not generate image. Check browser console.", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    const copyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        toast.success("Address copied!");
    };

    const getCounterpartyInfo = () => {
        if (variant === 'received') {
            return {
                label: 'From',
                username: gift?.username || 'Unknown Sender',
                avatar: gift?.avatar,
                wallet: gift.senderWallet,
                id: gift?._id,
                variantColor: 'bg-[#4ADE80]',
                variantIcon: <ArrowDownLeft size={16} strokeWidth={3} />
            };
        } else {
            return {
                label: 'To',
                username: gift?.username || 'Unknown Recipient',
                avatar: gift?.avatar,
                wallet: gift.receiverWallet,
                id: gift?._id,
                variantColor: 'bg-[#60A5FA]',
                variantIcon: <ArrowUpRight size={16} strokeWidth={3} />
            };
        }
    };

    const counterparty = getCounterpartyInfo();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 12px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #F1F5F9; 
                        border-radius: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: #CBD5E1; 
                        border-radius: 6px;
                        border: 3px solid #F1F5F9;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: #94A3B8;
                    }
                `}</style>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 100 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative w-full max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] custom-scrollbar"
                >
                    {/* The Card to Capture */}
                    <div
                        ref={modalRef}
                        className="bg-white overflow-hidden relative border-[4px] border-slate-900 rounded-[2rem] shadow-[8px_8px_0_0_rgba(15,23,42,1)]"
                    >
                        {/* Playful Header - NO GRADIENTS */}
                        <div className="bg-[#FFD166] p-6 text-center relative overflow-hidden border-b-[4px] border-slate-900">
                            {/* Decorative Pattern - Polka dots */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]"></div>

                            <motion.div
                                animate={{ rotate: [0, -2, 2, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="inline-block"
                            >
                                <h2 className="text-4xl font-['Lilita_One'] text-slate-900 tracking-wider">
                                    GiftChain.fun
                                </h2>
                            </motion.div>

                            <div
                                className="exclude-from-capture absolute top-4 right-4 text-slate-900 cursor-pointer hover:scale-110 transition-all z-20 bg-white border-2 border-slate-900 p-1.5 rounded-full shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none"
                                onClick={onClose}
                            >
                                <X size={20} strokeWidth={3} />
                            </div>
                        </div>

                        {/* Gift Content - NO GRADIENTS */}
                        <div className="p-8 pb-10 flex flex-col items-center gap-6 bg-white relative">

                            {/* 1️⃣ Sent / Received Stamp Indicator */}
                            <motion.div
                                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                                animate={{ scale: 1, opacity: 1, rotate: -5 }}
                                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                                className={`absolute top-4 right-8 z-20 px-4 py-1.5 rounded-lg border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] ${counterparty.variantColor} text-slate-900 font-black uppercase text-sm tracking-widest flex items-center gap-2`}
                            >
                                {counterparty.variantIcon}
                                {variant === 'sent' ? 'SENT GIFT' : 'RECEIVED'}
                            </motion.div>

                            {/* Amount Section */}
                            <div className="text-center space-y-3 w-full mt-4">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-6xl font-['Lilita_One'] text-slate-900 drop-shadow-sm py-2"
                                >
                                    ${gift.amountUSD.toFixed(2)}
                                </motion.div>
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center gap-2 bg-[#E0F2FE] px-4 py-2 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0_0_#93C5FD]"
                                >
                                    <span className="text-[#0369A1] font-bold text-sm tracking-wide">
                                        ≈ {(Number(gift.totalTokenAmount) / 1_000_000_000).toFixed(2)} {gift.tokenSymbol.toUpperCase()}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Wrapper Image with pop effect */}
                            <div className="relative mt-4 group cursor-pointer">
                                {/* Animated Star Burst Background */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                    className="absolute -inset-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 rounded-full"
                                />

                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 3 }}
                                    className="relative z-10"
                                >
                                    <div className="absolute inset-0 bg-yellow-300 rounded-2xl transform rotate-6 border-2 border-slate-900 z-0 group-hover:rotate-12 transition-transform"></div>
                                    <img
                                        src={gift.wrapper}
                                        alt="Wrapper"
                                        crossOrigin="anonymous"
                                        className="w-48 h-48 rounded-2xl border-4 border-slate-900 relative z-10 bg-white object-cover shadow-sm group-hover:shadow-[8px_8px_0_0_rgba(15,23,42,0.2)] transition-all"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-wrapper.png';
                                            (e.target as HTMLImageElement).style.backgroundColor = '#ddd';
                                        }}
                                    />
                                </motion.div>

                                {/* Floating mini stickers */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute -right-4 -top-4 text-3xl z-20 pointer-events-none drop-shadow-md"
                                >
                                    ✨
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                                    className="absolute -left-4 -bottom-4 text-3xl z-20 pointer-events-none drop-shadow-md"
                                >
                                    🎲
                                </motion.div>
                            </div>

                            {/* Message Bubble */}
                            {gift.message && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="w-full bg-[#FFF1F2] p-6 rounded-[1.5rem] border-4 border-slate-900 text-center relative mt-6 shadow-[6px_6px_0_0_rgba(251,113,133,1)]"
                                >
                                    <div className="absolute -top-5 left-8 bg-[#FB7185] text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border-[3px] border-slate-900 transform -rotate-3 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                                        Personal Note
                                    </div>
                                    <p className="text-slate-900 font-lexend font-bold text-lg leading-relaxed mt-1">
                                        "{gift.message.length > 200 ? `${gift.message.slice(0, 200)}...` : `${gift.message}`}"
                                    </p>
                                </motion.div>
                            )}

                            {/* User Card */}
                            <div
                                onClick={() => window.location.href = `/${counterparty.username}`}
                                className="w-full bg-white rounded-2xl p-4 border-[3px] border-slate-200 hover:border-slate-900 flex items-center gap-4 cursor-pointer hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all group mt-2"
                            >
                                <Avatar className="w-14 h-14 border-2 border-slate-900">
                                    <AvatarImage src={counterparty.avatar} className="object-cover" />
                                    <AvatarFallback className="bg-[#A78BFA] text-white font-bold text-xl border-2 border-slate-900">
                                        {counterparty.username[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden text-left">
                                    <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider mb-0.5">{counterparty.label}</div>
                                    <div className="font-black text-slate-800 text-lg truncate group-hover:text-[#7C3AED] transition-colors">
                                        @{counterparty.username}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-100 inline-block px-2 py-1 rounded-md border border-slate-200">
                                        {counterparty.wallet.slice(0, 6)}...{counterparty.wallet.slice(-4)}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); copyAddress(counterparty.wallet); }}
                                            className="hover:text-slate-900 p-0.5 rounded cursor-pointer exclude-from-capture"
                                        >
                                            <Copy size={12} />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-300 group-hover:text-slate-900 transition-colors pr-1 exclude-from-capture">
                                    <ExternalLink size={20} />
                                </div>
                            </div>

                            {/* Action Button Section - Excluded from download */}
                            <div className="w-full pt-4 exclude-from-capture">
                                {!isClaimed && variant === 'received' ? (
                                    <motion.button
                                        whileHover={!isProcessing ? { scale: 1.02 } : {}}
                                        whileTap={!isProcessing ? { scale: 0.98 } : {}}
                                        onClick={handleClaim}
                                        disabled={isProcessing}
                                        className={`w-full py-4 rounded-2xl font-black text-xl border-[3px] border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2
                                            ${isProcessing
                                                ? 'bg-gray-400 text-slate-700 cursor-wait shadow-none translate-y-[6px]'
                                                : 'bg-[#4ADE80] text-slate-900 active:shadow-none active:translate-y-[6px]'
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 size={28} className="animate-spin" />
                                                CLAIMING...
                                            </>
                                        ) : (
                                            <>
                                                <GiftIcon size={28} className="animate-bounce" strokeWidth={2.5} />
                                                CLAIM GIFT
                                            </>
                                        )}
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg border-[3px] border-slate-900 shadow-[6px_6px_0_0_#94a3b8] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:translate-y-0 disabled:shadow-[6px_6px_0_0_#94a3b8]"
                                    >
                                        {isDownloading ? (
                                            "Capturing..."
                                        ) : (
                                            <>
                                                <Download size={22} strokeWidth={2.5} />
                                                Share This Moment
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>

                        </div>
                    </div>
                    {/* Padding for scroll */}
                    <div className="h-8"></div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
