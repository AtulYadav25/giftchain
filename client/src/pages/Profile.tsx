import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    ArrowUpRight,
    ArrowDownLeft,
    Package,
    Download,
    X,
    Sparkles,
    Copy,
    ChevronLeft,
    ChevronRight,
    Check,
    Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import SendGiftModal from '../components/SendGiftModal';
import UsernameSetupModal from '../components/UsernameSetupModal';
import { useUser, useAuthActions, useAuthLoading } from '@/store';
import { Camera, Save, Loader2 } from 'lucide-react';
import GiftRevealModal from '../components/GiftRevealModal';
import type { Gift as GiftType } from '@/types/gift.types';

import {
    useSentGifts,
    useReceivedGifts,
    useSentMeta,
    useReceivedMeta,
    useGiftActions,
    useGiftLoading
} from '@/store/useGiftStore';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8; // Adjust limit as needed

const Profile = () => {
    const [activeBreakdown, setActiveBreakdown] = useState<'sent' | 'received' | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

    const navigate = useNavigate();
    const user = useUser();
    const { updateProfile } = useAuthActions();
    const isProfileUpdating = useAuthLoading();

    useEffect(() => {
        if (!user?.address) {
            navigate('/')
            toast.error("User not found");
            return;
        };
    }, [user])

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            toast.error("File size must be less than 1MB");
            return;
        }

        setAvatarFile(file);
        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile) return;
        try {
            await updateProfile({ avatar: avatarFile });
            setAvatarFile(null); // Clear file selection
            setAvatarPreview(null); // Clear preview, user object should update via store
        } catch (error) {
            console.error("Failed to update avatar");
        }
    };

    // Store Hooks
    const sentGifts = useSentGifts();
    const receivedGifts = useReceivedGifts();
    const sentMeta = useSentMeta();
    const receivedMeta = useReceivedMeta();
    const isGiftLoading = useGiftLoading();

    // Actions
    const { fetchSentGifts, fetchReceivedGifts } = useGiftActions();

    // Modal State
    const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
    const [modalVariant, setModalVariant] = useState<'sent' | 'received'>('sent');

    const handleOpenGift = (gift: GiftType, variant: 'sent' | 'received') => {
        setSelectedGift(gift);
        setModalVariant(variant);
    };

    // Unopened Gifts Logic (Received & Status=sent)
    const unopenedGifts = receivedGifts.filter(g => g.status === 'sent');

    // Pagination States
    const [sentPage, setSentPage] = useState(1);
    const [receivedPage, setReceivedPage] = useState(1);

    // Fetch Sent Gifts
    React.useEffect(() => {
        if (!user?.address) return;
        fetchSentGifts(user?.address || '', sentPage, ITEMS_PER_PAGE);
    }, [sentPage, fetchSentGifts, user?.address]);

    // Fetch Received Gifts
    React.useEffect(() => {
        if (!user?.address) return;
        fetchReceivedGifts(user?.address || '', receivedPage, ITEMS_PER_PAGE);
    }, [receivedPage, fetchReceivedGifts, user?.address]);

    // Total Pages (from meta)
    const totalSentPages = sentMeta?.totalPages || 1;
    const totalReceivedPages = receivedMeta?.totalPages || 1;

    // Address Helper
    const formatAddress = (address: string) => {
        return (
            <span className="font-mono text-slate-500 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                <span className="md:hidden">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                <span className="hidden md:inline">{`${address.slice(0, 12)}...${address.slice(-10)}`}</span>
            </span>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied!");
    };

    return (
        <div className="min-h-screen pb-20 font-['Lilita_One'] text-slate-900 bg-[#E3F4FF]">
            <div className="max-w-5xl mx-auto px-6 pt-12 space-y-16">

                {/* 1. Top Section */}
                <header className="flex flex-col md:flex-row items-center gap-8 mt-12">
                    <div className="relative group w-36 h-36">
                        <div className="w-full h-full rounded-full bg-white relative border-[5px] border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)] overflow-hidden">
                            <img
                                src={avatarPreview || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=santa"}
                                alt="Avatar"
                                className="w-full h-full object-cover bg-white"
                            />

                            {/* Hover Overlay */}
                            <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white drop-shadow-md" size={32} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isProfileUpdating}
                                />
                            </label>
                        </div>

                        {/* Save Button (Visible only when file selected) */}
                        <AnimatePresence>
                            {avatarFile && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={handleSaveAvatar}
                                    disabled={isProfileUpdating}
                                    className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#4ADE80] text-slate-900 border-[3px] border-slate-900 px-4 py-1.5 rounded-full text-sm font-black shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 z-10 whitespace-nowrap"
                                >
                                    {isProfileUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Save
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Decorative Sparkle */}
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 bg-[#FDE047] text-slate-900 p-2 rounded-full border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] z-0"
                        >
                            <Sparkles size={20} fill="currentColor" />
                        </motion.div>
                    </div>

                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-5xl md:text-6xl text-slate-900 drop-shadow-sm leading-tight">
                            Hey, <span className="text-[#3B82F6]">{user?.username}</span>!
                        </h1>
                        <p className="text-xl font-lexend text-slate-600 font-medium tracking-wide max-w-lg">
                            Track everything you’ve sent and received, all wrapped with big love! ✨
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsGiftModalOpen(true)}
                            className="mt-6 font-lexend px-8 py-3 bg-[#F472B6] text-slate-900 rounded-2xl font-black text-lg border-[3px] border-slate-900 shadow-[5px_5px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[5px] transition-all flex items-center gap-2 mx-auto md:mx-0"
                        >
                            <Heart className="fill-slate-900" size={24} />
                            GIFT SOMEONE
                        </motion.button>
                    </div>
                </header>

                {/* 2. Unopened Gifts Gallery */}
                {unopenedGifts.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-[#F472B6] p-2 rounded-xl border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]">
                                <Gift className="text-slate-900" size={24} />
                            </div>
                            <h2 className="text-3xl text-slate-900 tracking-wide">WAITING FOR YOU...</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {unopenedGifts.map((gift) => (
                                <motion.div
                                    key={gift._id}
                                    whileHover={{ y: -6, rotate: 1 }}
                                    onClick={() => handleOpenGift(gift, 'received')}
                                    className="aspect-square rounded-[2rem] bg-white border-[4px] border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative cursor-pointer group overflow-hidden"
                                >
                                    {/* Wrapper Image */}
                                    <img
                                        src={gift.wrapper}
                                        alt="Gift Wrapper"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/40 backdrop-blur-sm">
                                        <div className="bg-[#FFD166] text-slate-900 border-[3px] border-slate-900 rounded-xl px-4 py-2 transform -rotate-3 mb-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                            <span className="text-xl font-bold block leading-none">
                                                From {(typeof gift.senderId === 'object' ? gift.senderId.username : 'Someone')}
                                            </span>
                                        </div>
                                        <div className="bg-white text-slate-900 border-[3px] border-slate-900 rounded-full px-3 py-1 text-sm font-black transform rotate-2">
                                            OPEN ME!
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Stats Row Using Sticker Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatsCard
                        icon={<ArrowUpRight size={28} className="text-slate-900" />}
                        label="Total Sent"
                        value={`${sentMeta?.total || 0} Gifts`}
                        color="bg-[#60A5FA]"
                        onShowBreakdown={() => setActiveBreakdown('sent')}
                    />
                    <StatsCard
                        icon={<ArrowDownLeft size={28} className="text-slate-900" />}
                        label="Total Received"
                        value={`${receivedMeta?.total || 0} Gifts`}
                        color="bg-[#4ADE80]"
                        onShowBreakdown={() => setActiveBreakdown('received')}
                    />
                </section>

                {/* 5. Tables Section */}
                <section className="flex flex-col gap-12 font-sans">

                    {/* Sent Gifts Table */}
                    <TableCard
                        title="Gifts You Sent"
                        color="bg-[#60A5FA]"
                        icon={<ArrowUpRight size={20} className="text-slate-900" />}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend text-slate-700">
                                <thead className="text-slate-500 border-b-2 border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-black uppercase text-xs tracking-wider min-w-[200px]">To</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Amount</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Date</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 font-medium">
                                    {isGiftLoading && sentGifts.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 font-bold"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                                    ) : sentGifts.map((gift) => (
                                        <tr
                                            key={gift._id}
                                            onClick={() => handleOpenGift(gift, 'sent')}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 pl-4 flex items-center gap-2">
                                                {formatAddress(gift.receiverWallet || '')}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(gift.receiverWallet); }}
                                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold">{gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol.toUpperCase()}`}</td>
                                            <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4">
                                                <StatusBadge status={gift.status || 'sent'} />
                                            </td>
                                        </tr>
                                    ))}
                                    {!isGiftLoading && sentGifts.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-medium">No gifts sent yet. Start gifting!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalSentPages > 1 && (
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setSentPage(p => Math.max(1, p - 1))}
                                    disabled={!sentMeta?.hasPrevPage}
                                    className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
                                >
                                    <ChevronLeft size={24} strokeWidth={3} />
                                </button>
                                <span className="text-base font-black text-slate-900 px-2">
                                    {sentPage} / {totalSentPages}
                                </span>
                                <button
                                    onClick={() => setSentPage(p => Math.min(totalSentPages, p + 1))}
                                    disabled={!sentMeta?.hasNextPage}
                                    className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
                                >
                                    <ChevronRight size={24} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </TableCard>

                    {/* Received Gifts Table */}
                    <TableCard
                        title="Gifts You Received"
                        color="bg-[#4ADE80]"
                        icon={<ArrowDownLeft size={20} className="text-slate-900" />}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend text-slate-700">
                                <thead className="text-slate-500 border-b-2 border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-black uppercase text-xs tracking-wider min-w-[200px]">From</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Amount</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Date</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 font-medium">
                                    {isGiftLoading && receivedGifts.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 font-bold"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                                    ) : receivedGifts.map((gift) => (
                                        <tr
                                            key={gift._id}
                                            onClick={() => handleOpenGift(gift, 'received')}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 pl-4 flex items-center gap-2">
                                                {formatAddress(gift.senderWallet || '')}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(gift.senderWallet); }}
                                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold">{gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol?.toUpperCase()}`}</td>
                                            <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4">
                                                <StatusBadge status={gift.status || 'sent'} />
                                            </td>
                                        </tr>
                                    ))}
                                    {!isGiftLoading && receivedGifts.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-medium">No gifts received yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalReceivedPages > 1 && (
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setReceivedPage(p => Math.max(1, p - 1))}
                                    disabled={!receivedMeta?.hasPrevPage}
                                    className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
                                >
                                    <ChevronLeft size={24} strokeWidth={3} />
                                </button>
                                <span className="text-base font-black text-slate-900 px-2">
                                    {receivedPage} / {totalReceivedPages}
                                </span>
                                <button
                                    onClick={() => setReceivedPage(p => Math.min(totalReceivedPages, p + 1))}
                                    disabled={!receivedMeta?.hasNextPage}
                                    className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
                                >
                                    <ChevronRight size={24} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </TableCard>
                </section>

                {/* 6. Quote Box */}
                <div className="bg-[#FFF1F2] border-[3px] border-slate-900 rounded-[2rem] p-6 text-center max-w-2xl mx-auto shadow-[6px_6px_0_0_rgba(251,113,133,1)]">
                    <p className="text-slate-900 text-lg font-lexend font-medium leading-relaxed italic">
                        “GiftChain makes sending crypto gifts warm, personal, and memorable. Wrap your love, write a message, and let someone open joy straight from their wallet.”
                    </p>
                </div>

            </div>

            {/* 4. Breakdown Modal Pop Style */}
            <AnimatePresence>
                {activeBreakdown && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveBreakdown(null)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 100 }}
                            className="relative bg-white border-[4px] border-slate-900 p-0 rounded-[2rem] shadow-[8px_8px_0_0_rgba(15,23,42,1)] max-w-sm w-full text-center overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`p-6 border-b-[4px] border-slate-900 ${activeBreakdown === 'sent' ? 'bg-[#60A5FA]' : 'bg-[#4ADE80]'}`}>
                                <h3 className="text-3xl text-slate-900 drop-shadow-sm font-['Lilita_One'] tracking-wide">
                                    {activeBreakdown === 'sent' ? 'SENT GIFTS' : 'RECEIVED GIFTS'}
                                </h3>
                                <button
                                    onClick={() => setActiveBreakdown(null)}
                                    className="absolute top-4 right-4 p-1.5 bg-white border-2 border-slate-900 rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none"
                                >
                                    <X size={20} className="text-slate-900" strokeWidth={3} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <div className="text-7xl font-['Lilita_One'] text-slate-900 drop-shadow-[2px_2px_0_#cbd5e1]">
                                        {activeBreakdown === 'sent' ? sentMeta?.total || 0 : receivedMeta?.total || 0}
                                    </div>
                                    <div className="text-slate-500 font-bold uppercase tracking-wider text-sm">
                                        Total Gifts {activeBreakdown === 'sent' ? 'Sent' : 'Received'}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4 py-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-2xl animate-bounce shadow-[4px_4px_0_0_rgba(15,23,42,1)]" style={{ animationDelay: `${i * 0.1}s` }}>
                                            {activeBreakdown === 'sent' ? '🚀' : '🎁'}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-600 font-medium font-lexend italic">
                                    {activeBreakdown === 'sent' ? "You're spreading so much joy! 💖" : "Look at all this love! 🎁"}
                                </p>

                                <button className="w-full bg-slate-800 text-white border-[3px] border-slate-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-[4px_4px_0_0_#94a3b8] active:translate-y-[4px] active:shadow-none">
                                    <Download size={20} strokeWidth={2.5} />
                                    Share Stats
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />

            {/* Gift Reveal Modal */}
            {selectedGift && (
                <GiftRevealModal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    gift={selectedGift}
                    variant={modalVariant}
                />
            )}

            {/* Username Setup Modal */}
            <UsernameSetupModal isOpen={!!user && !user.username} />
        </div>
    );
};

// Helper Components

const StatsCard = ({ icon, label, value, color, onShowBreakdown }: { icon: React.ReactNode, label: string, value: string, color: string, onShowBreakdown: () => void }) => (
    <div className={`bg-white border-[4px] border-slate-900 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[8px_8px_0_0_rgba(15,23,42,1)] hover:translate-y-[-4px] transition-transform`}>
        <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${color} border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]`}>
                {icon}
            </div>
            <div className="text-center sm:text-left">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-1">{label}</div>
                <div className="text-3xl text-slate-900 leading-none">{value}</div>
            </div>
        </div>

        <button
            onClick={onShowBreakdown}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-[3px] border-slate-900 shadow-[4px_4px_0_0_#cbd5e1] active:translate-y-[3px] active:shadow-none"
        >
            DETAILS
        </button>
    </div>
);

const TableCard = ({ title, icon, color, children }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-[2.5rem] p-8 border-[4px] border-slate-900 shadow-[10px_10px_0_0_rgba(15,23,42,1)] w-full relative overflow-hidden">

        {/* Decorative corner stripe */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-20 -mr-10 -mt-10 rounded-full blur-3xl pointer-events-none`}></div>

        <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`p-3 ${color} rounded-xl border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]`}>
                {icon}
            </div>
            <h3 className="text-3xl font-['Lilita_One'] text-slate-900 tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isOpened = status === "Opened";
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide inline-flex items-center gap-1 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${isOpened
            ? "bg-[#4ADE80] text-slate-900"
            : "bg-[#FDE047] text-slate-900"
            }`}>
            {isOpened && <Check size={14} strokeWidth={3} />}
            {status}
        </span>
    );
};

export default Profile;
