import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gift,
    ArrowUpRight,
    ArrowDownLeft,
    Copy,
    Twitter,
    Instagram,
    Globe,
    Check,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/store';
import {
    useSentGifts,
    useReceivedGifts,
    useGiftActions,
    useGiftLoading
} from '@/store/useGiftStore';
import SendGiftModal from '../components/SendGiftModal';
import GiftRevealModal from '../components/GiftRevealModal';
import type { Gift as GiftType } from '@/types/gift.types';

const Profile = () => {
    const navigate = useNavigate();
    const user = useUser();

    useEffect(() => {
        if (!user?.address) {
            navigate('/');
            toast.error("Please login to view profile");
        }
    }, [user, navigate]);

    // State
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
    const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);

    // Store Data
    const sentGifts = useSentGifts();
    const receivedGifts = useReceivedGifts();
    const isLoading = useGiftLoading();
    const { fetchSentGifts, fetchReceivedGifts } = useGiftActions();

    useEffect(() => {
        if (user?.address) {
            fetchSentGifts(user.address, 1, 8);
            fetchReceivedGifts(user.address, 1, 8);
        }
    }, [user?.address, fetchSentGifts, fetchReceivedGifts]);

    // Mock Goal
    const activeGoal = {
        title: "New Mac Studio for Coding 🖥️",
        description: "I'm building GiftChain day and night! My current laptop is struggling to keep up with all the compiling. Help me upgrade so I can ship features faster!",
        raised: 1250,
        target: 3000,
        isLive: true
    };
    const progress = (activeGoal.raised / activeGoal.target) * 100;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied!");
    };

    const currentGifts = activeTab === 'sent' ? sentGifts : receivedGifts;

    return (
        <div className="min-h-screen bg-[#F0F9FF] font-['Lilita_One'] pb-20">
            {/* Navbar Placeholder or Back Button if needed */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 1. User Section */}
                <section className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 mx-auto rounded-full border-[5px] border-slate-900 overflow-hidden shadow-[6px_6px_0_0_rgba(15,23,42,1)] bg-white">
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl text-slate-900 drop-shadow-sm">{user?.username || 'Anonymous'}</h1>
                        <p className="font-lexend text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                            {user?.bio || "Just a creator spreading joy! ✨"}
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center gap-4">
                        {[
                            { icon: Twitter, href: "#" },
                            { icon: Instagram, href: "#" },
                            { icon: Globe, href: "#" }
                        ].map((item, i) => (
                            <a key={i} href={item.href} className="p-3 bg-white border-2 border-slate-900 rounded-full text-slate-900 hover:scale-110 transition-transform shadow-[3px_3px_0_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none">
                                <item.icon size={20} />
                            </a>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsGiftModalOpen(true)}
                        className="bg-[#F472B6] text-slate-900 border-[3px] border-slate-900 px-8 py-3 rounded-xl font-bold text-lg shadow-[5px_5px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all inline-flex items-center gap-2"
                    >
                        <Gift size={24} className="fill-slate-900" />
                        Gift Someone
                    </motion.button>
                </section>

                {/* 2. Goal Section */}
                <section className="bg-white rounded-[2.5rem] border-[4px] border-slate-900 p-8 shadow-[10px_10px_0_0_rgba(15,23,42,1)] relative overflow-hidden max-w-2xl mx-auto">
                    {activeGoal.isLive && (
                        <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full border-2 border-red-600 font-black text-xs uppercase tracking-wider animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            LIVE
                        </div>
                    )}

                    <h2 className="text-3xl text-slate-900 mb-4">{activeGoal.title}</h2>
                    <p className="font-lexend text-slate-600 font-medium leading-relaxed text-lg mb-8">
                        {activeGoal.description}
                    </p>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end font-black text-slate-900 font-lexend">
                            <span className="text-3xl">${activeGoal.raised}</span>
                            <span className="text-slate-400 text-lg">of ${activeGoal.target}</span>
                        </div>
                        <div className="h-6 bg-slate-100 rounded-full border-[3px] border-slate-900 p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-[#FFD166] rounded-full"
                            />
                        </div>
                        <div className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest font-lexend">
                            ${activeGoal.target - activeGoal.raised} TO GO
                        </div>
                    </div>
                </section>

                {/* 3. Stats Cards */}
                <section className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-[#60A5FA] border-[4px] border-slate-900 rounded-[2rem] p-6 text-center shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                        <p className="font-lexend text-xs font-black text-slate-900/60 uppercase tracking-widest mb-1">Total Sent</p>
                        <p className="text-4xl text-slate-900 drop-shadow-sm">{sentGifts.length} Gifts</p>
                    </div>
                    <div className="bg-[#4ADE80] border-[4px] border-slate-900 rounded-[2rem] p-6 text-center shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                        <p className="font-lexend text-xs font-black text-slate-900/60 uppercase tracking-widest mb-1">Total Received</p>
                        <p className="text-4xl text-slate-900 drop-shadow-sm">{receivedGifts.length} Gifts</p>
                    </div>
                </section>

                {/* 4. Gifts Table */}
                <section className="bg-white rounded-[2.5rem] border-[4px] border-slate-900 p-8 shadow-[10px_10px_0_0_rgba(15,23,42,1)] max-w-4xl mx-auto">
                    <div className="flex gap-4 mb-8">
                        {['sent', 'received'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-xl border-2 border-slate-900 font-bold text-lg transition-all shadow-[3px_3px_0_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none uppercase ${activeTab === tab
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Gifts {tab}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-lexend">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="pb-4 pl-4 font-black text-slate-400 uppercase text-xs">
                                        {activeTab === 'sent' ? 'To' : 'From'}
                                    </th>
                                    <th className="pb-4 font-black text-slate-400 uppercase text-xs">Amount</th>
                                    <th className="pb-4 font-black text-slate-400 uppercase text-xs">Date</th>
                                    <th className="pb-4 font-black text-slate-400 uppercase text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-bold text-slate-700">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                                ) : currentGifts.map((gift) => (
                                    <tr
                                        key={gift._id}
                                        onClick={() => { setSelectedGift(gift); }}
                                        className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="py-4 pl-4 flex items-center gap-2">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                {(activeTab === 'sent' ? gift.receiverWallet : gift.senderWallet)?.slice(0, 6)}...
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(activeTab === 'sent' ? gift.receiverWallet : gift.senderWallet) }} className="hover:text-slate-900 text-slate-400">
                                                <Copy size={12} />
                                            </button>
                                        </td>
                                        <td className="py-4">
                                            {gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol?.toUpperCase()}`}
                                        </td>
                                        <td className="py-4 text-xs text-slate-500 uppercase">
                                            {new Date(gift.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase border font-black ${gift.status === 'opened' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                                }`}>
                                                {gift.status === 'opened' && <Check size={10} strokeWidth={4} />}
                                                {gift.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
                {selectedGift && (
                    <GiftRevealModal
                        isOpen={!!selectedGift}
                        onClose={() => setSelectedGift(null)}
                        gift={selectedGift}
                        variant={activeTab}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile;
