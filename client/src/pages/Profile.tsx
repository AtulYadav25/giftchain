import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    X,
    Sparkles,
    Copy,
    ChevronLeft,
    ChevronRight,
    Check,
    Heart,
    Settings,
    Camera,
    Save,
    RefreshCw,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import SendGiftModal from '../components/SendGiftModal';
import EditProfileModal from '../components/EditProfileModal';
import { useUser, useAuthActions, useAuthLoading, useAuthSessionLoading } from '@/store';
import { Loader2 } from 'lucide-react';
import GiftRevealModal from '../components/GiftRevealModal';
import VerifyGiftModal from '../components/VerifyGiftModal';
import type { Gift as GiftType } from '@/types/gift.types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import SocialIconDetector from '../components/SocialIconDetector';
import truncateSmart from '@/lib/truncateSmart';

import {
    useSentGifts,
    useReceivedGifts,
    useSentMeta,
    useReceivedMeta,
    useGiftActions,
    useDeletingGift,
    useSentGiftsLoading,
    useReceivedGiftsLoading,
} from '@/store/useGiftStore';
import { useWrappers, useWrapperActions } from '@/store/useWrapperStore';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8;


function normalizeUrl(url: string) {
    if (!url) return "#";

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `https://${url}`;
}


const Profile = () => {
    const [activeBreakdown, setActiveBreakdown] = useState<'sent' | 'received' | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    // const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const navigate = useNavigate();
    const user = useUser();
    const { updateProfile } = useAuthActions();
    const isProfileUpdating = useAuthLoading();
    const isSessionLoading = useAuthSessionLoading();

    useEffect(() => {
        if (!user?.address && isSessionLoading === false) {
            navigate('/')
            toast.error("User not found");
            return;
        };
    }, [user, isSessionLoading])

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // TODO : When Clicked on Unverified status gift then show a modal to verify the gift by giving the txDigest as input
    // TODO : Also Allow Unverified Gift to delete and create API Endpoint in backend

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
        }
    };

    // Store Hooks
    const sentGifts = useSentGifts();
    const receivedGifts = useReceivedGifts();
    const sentMeta = useSentMeta();
    const receivedMeta = useReceivedMeta();
    const wrappers = useWrappers();
    const isSentGiftLoading = useSentGiftsLoading();
    const isReceivedGiftLoading = useReceivedGiftsLoading();
    const isDeleting = useDeletingGift();

    // Actions
    const { fetchMySentGifts, fetchMyReceivedGifts, deleteUnVerifiedGift } = useGiftActions();
    const { fetchWrappers } = useWrapperActions();

    // Modal State
    const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
    const [modalVariant, setModalVariant] = useState<'sent' | 'received'>('sent');
    const [giftToDelete, setGiftToDelete] = useState<string | null>(null);

    const handleOpenGift = (gift: GiftType, variant: 'sent' | 'received') => {
        setSelectedGift(gift);
        setModalVariant(variant);
    };

    // Unopened Gifts Logic (Received & Status=sent)
    const unopenedGifts = receivedGifts.filter(g => g.status === 'sent');

    // Pagination States
    const [sentPage, setSentPage] = useState(1);
    const [receivedPage, setReceivedPage] = useState(1);

    // 4. Optimized Fetching Logic

    // Fetch Sent Gifts (Only if data missing or page changed)
    // Fetch Sent Gifts (Store handles caching)
    React.useEffect(() => {
        if (!user?.address) return;
        fetchMySentGifts(sentPage, ITEMS_PER_PAGE);
    }, [sentPage, fetchMySentGifts, user?.address]);

    // Fetch Received Gifts (Store handles caching)
    React.useEffect(() => {
        if (!user?.address) return;
        fetchMyReceivedGifts(receivedPage, ITEMS_PER_PAGE);
    }, [receivedPage, fetchMyReceivedGifts, user?.address]);

    // Fetch Wrappers (Only once if empty)
    useEffect(() => {
        if (wrappers.length === 0) {
            fetchWrappers();
        }
    }, [wrappers.length, fetchWrappers]);

    // Manual Refresh Handlers
    const [isRefreshingSent, setIsRefreshingSent] = useState(false);
    const [isRefreshingReceived, setIsRefreshingReceived] = useState(false);

    const handleRefreshSent = async () => {
        setIsRefreshingSent(true);
        await fetchMySentGifts(sentPage, ITEMS_PER_PAGE, true);
        setIsRefreshingSent(false);
    };

    const handleRefreshReceived = async () => {
        if (!user?.address) return;
        setIsRefreshingReceived(true);
        await fetchMyReceivedGifts(receivedPage, ITEMS_PER_PAGE, true);
        setIsRefreshingReceived(false);
    };

    // Total Pages (from meta)
    const totalSentPages = Math.ceil((user?.sentCount || 0) / ITEMS_PER_PAGE) || 1;
    const totalReceivedPages = Math.ceil((user?.receivedCount || 0) / ITEMS_PER_PAGE) || 1;

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

    const handleDeleteUnverified = (e: React.MouseEvent, giftId: string) => {
        e.stopPropagation();
        setGiftToDelete(giftId);
    };

    const handleConfirmDelete = async () => {
        if (!giftToDelete) return;
        await deleteUnVerifiedGift(giftToDelete);
        setGiftToDelete(null);
        handleRefreshSent(); // Refresh list after delete
    };

    if (isSessionLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#E3F4FF]"><Loader2 className="animate-spin text-slate-900" size={48} /></div>;
    }

    return (
        <div className="min-h-screen pb-20 font-['Lilita_One'] text-slate-900 bg-[#E3F4FF]">

            {/* Banner Section */}
            <div className="h-48 md:h-64 w-full bg-slate-200 relative overflow-hidden border-b-[4px] border-slate-900">
                {user?.banner ? (
                    <img src={user.banner} alt="Profile Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-[#A5F3FC]"> {/* Default Placeholder Color */}
                        <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}></div>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10 space-y-12">

                {/* 1. Header & Profile Card */}
                <header className="flex flex-col md:flex-row items-start gap-8">
                    {/* Avatar Group */}
                    <div className="relative group w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-white relative border-[5px] border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)] overflow-hidden">
                            <Avatar className="w-full h-full">
                                <AvatarImage
                                    src={avatarPreview || user?.avatar}
                                    alt="Avatar"
                                    className="object-cover bg-white"
                                />
                                <AvatarFallback className="text-4xl font-black bg-slate-200">
                                    {user?.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Hover Overlay */}
                            <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
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
                                    className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#4ADE80] text-slate-900 border-[3px] border-slate-900 px-4 py-1.5 rounded-full text-sm font-black shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 z-10 whitespace-nowrap z-[100]"
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
                            className="absolute -top-2 -right-2 bg-[#FDE047] text-slate-900 p-2 rounded-full border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] z-10"
                        >
                            <Sparkles size={20} fill="currentColor" />
                        </motion.div>
                    </div>

                    {/* Profile Info & Actions */}
                    <div className="flex-1 mt-5 pt-6 md:pt-20 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl text-slate-900 drop-shadow-sm leading-tight">
                                    @{user?.username}
                                </h1>
                                {/* <div className="mt-2 flex items-center gap-2">
                                    {user?.address && formatAddress(user.address)}
                                </div> */}
                            </div>

                            <div className="flex items-center gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2 text-sm"
                                >
                                    <Settings size={18} />
                                    Edit Profile
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsGiftModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#F472B6] text-slate-900 rounded-xl tracking-wider text-white border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2 text-lg"
                                >
                                    <Heart className="fill-white" size={18} />
                                    Send Gift
                                </motion.button>
                            </div>
                        </div>

                        {/* Bio Section */}
                        {user?.bio && user.bio.length > 0 && (
                            <div className="font-lexend text-slate-600 font-medium leading-relaxed max-w-2xl bg-white/50 p-4 rounded-xl border-2 border-slate-200/50 backdrop-blur-sm">
                                {user.bio.map((paragraph, index) => (
                                    <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                                ))}

                                {/* Social Icons */}
                                {user.socials && user.socials.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t-2 border-slate-100">
                                        {user.socials.map((social, index) => (
                                            <a
                                                key={index}
                                                href={normalizeUrl(social.link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white text-slate-400 hover:text-slate-900 hover:scale-110 transition-all rounded-lg border-2 border-transparent hover:border-slate-200 hover:shadow-sm"
                                            >
                                                <SocialIconDetector url={social.link} className="w-5 h-5" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                        value={`$${(user?.totalSentUSD)?.toLocaleString() || 0}`}
                        color="bg-[#60A5FA]"
                        onShowBreakdown={() => setActiveBreakdown('sent')}
                    />
                    <StatsCard
                        icon={<ArrowDownLeft size={28} className="text-slate-900" />}
                        label="Total Received"
                        value={`${user?.receivedCount || 0} Gifts`}
                        color="bg-[#4ADE80]"
                        onShowBreakdown={() => setActiveBreakdown('received')}
                    />
                </section>

                {/* 5. Tables Section */}
                <section className="flex flex-col gap-12 font-sans">

                    {/* SENT GIFTS TABLE */}
                    <TableCard
                        title="Gifts Sent"
                        color="bg-[#60A5FA]"
                        icon={<ArrowUpRight size={20} className="text-slate-900" />}
                        onRefresh={handleRefreshSent}
                        isRefreshing={isRefreshingSent}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend text-slate-700">
                                <thead className="text-slate-500 border-b-2 border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-black uppercase text-xs tracking-wider min-w-[100px]">To</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Amount</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Date</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 font-medium">
                                    {isSentGiftLoading ? (
                                        [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-4 pl-4"><Skeleton className="h-5 w-32 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-5 w-24 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-5 w-20 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-8 w-24 rounded-full bg-slate-200" /></td>
                                            </tr>
                                        ))
                                    ) : sentGifts.map((gift) => (
                                        <tr key={gift._id} onClick={() => handleOpenGift(gift, 'sent')} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="py-4 pl-4 flex items-center gap-2">
                                                {formatAddress(gift.receiverWallet || '')}
                                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(gift.receiverWallet); }} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold">{gift.amountUSD ? `$${truncateSmart(gift.amountUSD)}` : `${gift.totalTokenAmount} ${gift.tokenSymbol.toUpperCase()}`}</td>
                                            <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 flex items-center gap-3">
                                                <StatusBadge status={gift.status || 'sent'} />
                                                {gift.status === 'unverified' && (
                                                    <button
                                                        onClick={(e) => handleDeleteUnverified(e, gift._id)}
                                                        disabled={isDeleting}
                                                        className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 hover:scale-110 transition-all border border-red-200 shadow-sm"
                                                        title="Delete Unverified Gift"
                                                    >
                                                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!isSentGiftLoading && sentGifts.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-medium">No gifts sent yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalSentPages > 1 && (
                            <PaginationControls page={sentPage} totalPages={totalSentPages} setPage={setSentPage} />
                        )}
                    </TableCard>

                    {/* RECEIVED GIFTS TABLE */}
                    <TableCard
                        title="Gifts Received"
                        color="bg-[#4ADE80]"
                        icon={<ArrowDownLeft size={20} className="text-slate-900" />}
                        onRefresh={handleRefreshReceived}
                        isRefreshing={isRefreshingReceived}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend text-slate-700">
                                <thead className="text-slate-500 border-b-2 border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-black uppercase text-xs tracking-wider min-w-[100px]">From</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Amount</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Date</th>
                                        <th className="pb-3 font-black uppercase text-xs tracking-wider min-w-[100px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 font-medium">
                                    {isReceivedGiftLoading ? (
                                        [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-4 pl-4"><Skeleton className="h-5 w-32 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-5 w-24 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-5 w-20 bg-slate-200" /></td>
                                                <td className="py-4"><Skeleton className="h-8 w-24 rounded-full bg-slate-200" /></td>
                                            </tr>
                                        ))
                                    ) : receivedGifts.map((gift, i) => (
                                        <tr key={i} onClick={() => handleOpenGift(gift, 'received')} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="py-4 pl-4 flex items-center gap-2">
                                                {formatAddress(gift.senderWallet || '')}
                                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(gift.senderWallet); }} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold">{gift.amountUSD ? `$${truncateSmart(gift.amountUSD)}` : `${gift.totalTokenAmount} ${gift.tokenSymbol?.toUpperCase()}`}</td>
                                            <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4"><StatusBadge status={gift.status || 'sent'} /></td>
                                        </tr>
                                    ))}
                                    {!isReceivedGiftLoading && receivedGifts.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-medium">No gifts received yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalReceivedPages > 1 && (
                            <PaginationControls page={receivedPage} totalPages={totalReceivedPages} setPage={setReceivedPage} />
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

            {/* Modals */}
            <AnimatePresence>
                {activeBreakdown && (
                    <BreakdownModal
                        type={activeBreakdown}
                        onClose={() => setActiveBreakdown(null)}
                        count={activeBreakdown === 'sent' ? sentMeta?.total || 0 : receivedMeta?.total || 0}
                    />
                )}
                {giftToDelete && (
                    <DeleteConfirmationModal
                        isOpen={!!giftToDelete}
                        onClose={() => setGiftToDelete(null)}
                        onConfirm={handleConfirmDelete}
                        isDeleting={isDeleting}
                    />
                )}
            </AnimatePresence>

            {isGiftModalOpen && (
                <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
            )}

            {user && (
                <EditProfileModal
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    user={user}
                />
            )}

            {/* Verify Gift Modal */}
            {selectedGift && selectedGift.status === 'unverified' && modalVariant === 'sent' ? (
                <VerifyGiftModal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    gift={selectedGift}
                />
            ) : selectedGift && (
                <GiftRevealModal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    gift={selectedGift}
                    variant={modalVariant}
                />
            )}

            {/* Username Setup Modal */}

        </div>
    );
};

// Helper Components

// Helper Components

const StatsCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string, onShowBreakdown: () => void }) => (
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

        {/* <button
            onClick={onShowBreakdown}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-[3px] border-slate-900 shadow-[4px_4px_0_0_#cbd5e1] active:translate-y-[3px] active:shadow-none"
        >
            DETAILS
        </button> */}
    </div>
);

const TableCard = ({ title, icon, color, children, onRefresh, isRefreshing }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode, onRefresh?: () => void, isRefreshing?: boolean }) => (
    <div className="bg-white rounded-[2.5rem]  p-8 border-[4px] border-slate-900 shadow-[10px_10px_0_0_rgba(15,23,42,1)] w-full relative overflow-hidden">
        {/* Decorative corner stripe */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-20 -mr-10 -mt-10 rounded-full blur-3xl pointer-events-none`}></div>
        {/* Title Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
                <div className={`p-3 ${color} rounded-xl border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]`}>
                    {icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-['Lilita_One'] text-slate-900 tracking-wide">{title}</h3>
            </div>

            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-2.5 bg-white hover:bg-slate-50 border-[3px] border-slate-900 rounded-xl shadow-[3px_3px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900"
                >
                    <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} strokeWidth={2.5} />
                </button>
            )}
        </div>
        {children}
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isOpened = status === "opened";
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

const PaginationControls = ({ page, totalPages, setPage }: { page: number, totalPages: number, setPage: (p: number | ((prev: number) => number)) => void }) => (
    <div className="flex items-center justify-end gap-2 mt-6">
        <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
        >
            <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <span className="text-base font-black text-slate-900 px-2">
            {page} / {totalPages}
        </span>
        <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border-2 border-transparent hover:border-slate-900 disabled:opacity-30 disabled:hover:border-transparent text-slate-900 transition-colors"
        >
            <ChevronRight size={24} strokeWidth={3} />
        </button>
    </div>
);

const BreakdownModal = ({ type, onClose, count }: { type: 'sent' | 'received', onClose: () => void, count: number }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative bg-white border-[4px] border-slate-900 p-0 rounded-[2rem] shadow-[8px_8px_0_0_rgba(15,23,42,1)] max-w-sm w-full text-center overflow-hidden"
        >
            <div className={`p-6 border-b-[4px] border-slate-900 ${type === 'sent' ? 'bg-[#60A5FA]' : 'bg-[#4ADE80]'}`}>
                <h3 className="text-3xl text-slate-900 drop-shadow-sm font-['Lilita_One'] tracking-wide">
                    {type === 'sent' ? 'SENT GIFTS' : 'RECEIVED GIFTS'}
                </h3>
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white border-2 border-slate-900 rounded-full hover:scale-110 transition-transform shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none">
                    <X size={20} className="text-slate-900" strokeWidth={3} />
                </button>
            </div>

            <div className="p-8 space-y-6">
                <div className="space-y-1">
                    <div className="text-7xl font-['Lilita_One'] text-slate-900 drop-shadow-[2px_2px_0_#cbd5e1]">{count}</div>
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-sm">
                        Total Gifts {type === 'sent' ? 'Sent' : 'Received'}
                    </div>
                </div>

                <div className="flex justify-center gap-4 py-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-2xl animate-bounce shadow-[4px_4px_0_0_rgba(15,23,42,1)]" style={{ animationDelay: `${i * 0.1}s` }}>
                            {type === 'sent' ? '🚀' : '🎁'}
                        </div>
                    ))}
                </div>
                <p className="text-slate-600 font-medium font-lexend italic">
                    {type === 'sent' ? "You're spreading so much joy! 💖" : "Look at all this love! 🎁"}
                </p>

                <button className="w-full bg-slate-800 text-white border-[3px] border-slate-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-[4px_4px_0_0_#94a3b8] active:translate-y-[4px] active:shadow-none">
                    <Download size={20} strokeWidth={2.5} />
                    Share Stats
                </button>
            </div>
        </motion.div>
    </div>
);

export default Profile;

const DeleteConfirmationModal = ({ onClose, onConfirm, isDeleting }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, isDeleting: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-[8px_8px_0_0_rgba(15,23,42,1)] border-[4px] border-slate-900 overflow-hidden"
        >
            <div className="p-6 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                    <Trash2 size={32} strokeWidth={2.5} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-['Lilita_One'] text-slate-900">Delete Gift?</h3>
                    <p className="text-slate-500 font-medium font-lexend">
                        Are you sure you want to delete this unverified gift? This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-3 font-bold border-[3px] border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-3 font-bold bg-red-500 text-white border-[3px] border-slate-900 rounded-xl shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
);
