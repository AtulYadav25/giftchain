import { useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// @ts-ignore
import confetti from 'canvas-confetti';
import QRCodeStyling from 'qr-code-styling';
import {
    Gift as GiftIcon,
    ArrowUpRight,
    Lock,
    CheckCircle2,
    Copy,
    Share2,
    Home
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGiftActions, useCurrentGift, useFetchingGiftLoading, useGiftError } from '@/store/useGiftStore';
import { useChain } from '@/multichainkit/context/ChainContext';
import toast from 'react-hot-toast';

export default function GiftDetails() {
    const { id } = useParams<{ id: string }>();
    const { fetchGiftById } = useGiftActions();
    const gift = useCurrentGift();
    const isLoading = useFetchingGiftLoading();
    const error = useGiftError();
    const { address } = useChain();

    // QR Ref for the page as well
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchGiftById(id);
        }
    }, [id]);

    useEffect(() => {
        if (gift) {
            // Trigger simple confetti on load for fun
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 10
            });
        }
    }, [gift]);

    // QR Code for this page
    const qrCode = useMemo(() => {
        if (!gift) return null;
        return new QRCodeStyling({
            width: 120,
            height: 120,
            type: 'svg',
            data: window.location.href,
            image: '',
            dotsOptions: {
                color: '#0f172a',
                type: 'rounded'
            },
            backgroundOptions: {
                color: '#ffffff',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 20
            },
            cornersSquareOptions: {
                type: 'extra-rounded'
            },
            cornersDotOptions: {
                type: 'dot'
            }
        })
    }, [gift]);

    useEffect(() => {
        if (qrCode && qrRef.current) {
            qrCode.append(qrRef.current);
        }
    }, [qrCode]);


    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                    <p className="font-bold text-slate-500">Loading gift details...</p>
                </div>
            </div>
        );
    }

    if (error || !gift) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-3xl font-black text-slate-900">Gift Not Found</h2>
                    <p className="text-slate-500">We couldn't find the gift you are looking for. It might have been deleted or the link is invalid.</p>
                    <Link to="/" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const isMessageVisible = address === gift.senderWallet || address === gift.receiverWallet;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const getExplorerLink = () => {
        if (gift.tokenSymbol === 'sol') {
            // Assuming devnet for now, or use mainnet based on env. Let's make it generic or default to solscan
            // If we had a chain config, we'd use that. For now, defaulting to solscan.io
            return `https://solscan.io/tx/${gift.deliveryTxHash || gift.senderTxHash}`;
        } else {
            // SUI
            return `https://suiscan.xyz/tx/${gift.deliveryTxHash || gift.senderTxHash}`; // Or suiscan.xyz
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#f9fbff]">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header Verification Badge */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-center gap-2 bg-[#DCFCE7] text-[#166534] px-6 py-3 rounded-2xl border-2 border-[#166534] shadow-sm w-fit mx-auto"
                >
                    <CheckCircle2 size={24} strokeWidth={3} />
                    <span className="font-black text-lg tracking-wide uppercase">Verified On Chain</span>
                </motion.div>

                <div className="bg-white rounded-[2.5rem] border-[4px] border-slate-900 shadow-[12px_12px_0_0_rgba(15,23,42,1)] overflow-hidden">

                    {/* Top Section: Visuals */}
                    <div className="bg-sky-600 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10"
                        >
                            <img
                                src={gift.wrapper}
                                alt="Gift Wrapper"
                                className="w-40 h-40 mx-auto rounded-3xl border-4 border-white shadow-2xl object-cover bg-white transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                            />
                            <div className="mt-6 text-white">
                                <h1 className="text-4xl font-['Lilita_One'] tracking-wide">
                                    ${gift.amountUSD.toFixed(2)}
                                </h1>
                                <p className="text-white/80 mt-1 tracking-widest text-sm bg-slate-800/50 inline-block px-3 py-1 rounded-full">
                                    ≈ {(Number(gift.totalTokenAmount) / 1_000_000_000).toFixed(4)} {gift.tokenSymbol.toUpperCase()}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Details Section */}
                    <div className="p-8 space-y-8">

                        {/* Message Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="bg-slate-100 p-1 rounded">💌</span> Personal Message
                            </h3>
                            {isMessageVisible ? (
                                <div className="bg-[#FFF1F2] p-6 rounded-2xl border-2 border-[#FECDD3] text-slate-800 font-medium font-lexend relative">
                                    <div className="absolute -top-3 -right-3 text-2xl rotate-12">📝</div>
                                    "{gift.message || "No message attached."}"
                                </div>
                            ) : (
                                <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                                    <Lock className="text-slate-400 mb-1" size={24} />
                                    <p className="text-slate-500 font-bold">This message is private.</p>
                                    <p className="text-slate-400 text-sm">Only the sender (@{gift.senderWallet === address ? 'You' : gift.username || 'Creator'}) and receiver can view it.</p>
                                </div>
                            )}
                        </div>

                        {/* Participants (Sender & Receiver) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* FROM */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">From</h3>
                                <Link to={`/${gift.senderId?.username || ''}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                                    <Avatar className="h-12 w-12 border-2 border-slate-200 group-hover:border-slate-900 transition-colors">
                                        <AvatarImage src={gift.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-bold">
                                            {gift.senderId?.username?.[0]?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-slate-900 truncate">@{gift.senderId?.username || 'Unknown'}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                                            {gift.senderWallet.slice(0, 4)}...{gift.senderWallet.slice(-4)}
                                            <Copy size={10} className="hover:text-slate-900" onClick={(e) => { e.preventDefault(); copyToClipboard(gift.senderWallet) }} />
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* TO */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">To</h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                                        <GiftIcon size={20} className="text-slate-400" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-slate-900">Recipient</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                                            {gift.receiverWallet.slice(0, 4)}...{gift.receiverWallet.slice(-4)}
                                            <Copy size={10} className="hover:text-slate-900 cursor-pointer" onClick={() => copyToClipboard(gift.receiverWallet)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blockchain Verification */}
                        <div className="border-t-2 border-slate-100 pt-6 space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="bg-slate-100 p-1 rounded">🔗</span> Blockchain Proof
                            </h3>

                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-bold text-sm">Network</span>
                                    <div className="flex items-center gap-2">
                                        {/* Simple Chain Icon logic */}
                                        <div className={`w-2 h-2 rounded-full ${gift.tokenSymbol === 'sol' ? 'bg-[#9945FF]' : 'bg-[#3B82F6]'}`}></div>
                                        <span className="font-bold text-slate-700 capitalize">
                                            {gift.tokenSymbol === 'sol' ? 'Solana' : 'Sui Network'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-bold text-sm">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${gift.status === 'opened' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {gift.status === 'opened' ? 'Claimed' : 'Unclaimed'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-bold text-sm">Transaction</span>
                                    <a
                                        href={getExplorerLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 font-bold text-sm flex items-center gap-1 hover:underline"
                                    >
                                        View on Explorer <ArrowUpRight size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Footer: QR & Share */}
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <div ref={qrRef} className="p-2 bg-white rounded-xl border-2 border-slate-100 shadow-sm" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Scan to Verify</p>

                            <div className="flex gap-2 w-full">
                                <Link to="/" className="flex-1 py-3 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:border-slate-900 hover:text-slate-900 transition-all text-center flex items-center justify-center gap-2">
                                    <Home size={18} /> Home
                                </Link>
                                <button
                                    onClick={() => {
                                        navigator.share?.({
                                            title: 'GiftChain Verification',
                                            text: `Verify this GiftChain gift: ${window.location.href}`,
                                            url: window.location.href
                                        }).catch(() => {
                                            copyToClipboard(window.location.href);
                                        })
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(15,23,42,0.3)] active:shadow-none active:translate-y-[2px]"
                                >
                                    <Share2 size={18} /> Share
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm font-medium">
                    GiftChain.fun • Trustless Gifting on Solana & Sui
                </p>
            </div>
        </div>
    );
}
