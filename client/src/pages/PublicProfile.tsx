import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Check,
    Heart,
    Loader2,
    Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import SendGiftModal from '../components/SendGiftModal';
import { useParams } from 'react-router-dom';
import { api, extractData } from '@/lib/api';
import type { User } from '@/types/auth.types';
import type { Gift as GiftType } from '@/types/gift.types';
import GiftRevealModal from '../components/GiftRevealModal';
import { useGiftActions, useGiftLoading, useReceivedGifts, useReceivedMeta, useSentGifts, useSentMeta } from '@/store/useGiftStore';
import { useAuthActions, usePublicProfile, usePublicProfileLoading } from '@/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialIconDetector from '../components/SocialIconDetector';

const ITEMS_PER_PAGE = 8;

const PublicProfile = () => {
    const { username } = useParams();

    // Store Hooks
    const profileUser = usePublicProfile();
    const loadingUser = usePublicProfileLoading();
    const { fetchPublicProfile } = useAuthActions();

    const sentGifts = useSentGifts();
    const receivedGifts = useReceivedGifts();
    const sentMeta = useSentMeta();
    const receivedMeta = useReceivedMeta();
    const isGiftLoading = useGiftLoading();

    // Actions
    const { fetchSentGifts, fetchReceivedGifts } = useGiftActions();

    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
    const [modalVariant, setModalVariant] = useState<'sent' | 'received'>('received');

    // Fetch User
    useEffect(() => {
        if (username) {
            fetchPublicProfile(username);
        }
    }, [username, fetchPublicProfile]);

    // Pagination
    const [sentPage, setSentPage] = useState(1);
    const [receivedPage, setReceivedPage] = useState(1);

    // Fetch Gifts when profileUser is loaded
    useEffect(() => {
        if (!profileUser?.address) return;

        // Fetch Sent if allowed
        if (profileUser.settings?.show_gift_sent !== false) {
            fetchSentGifts(profileUser.address, sentPage, ITEMS_PER_PAGE);
        }
    }, [profileUser, sentPage, fetchSentGifts]);


    useEffect(() => {
        if (!profileUser?.address) return;
        fetchReceivedGifts(profileUser.address, receivedPage, ITEMS_PER_PAGE);
    }, [profileUser, receivedPage, fetchReceivedGifts]);

    const totalSentPages = Math.ceil((profileUser?.sentCount || 0) / ITEMS_PER_PAGE) || 1;
    const totalReceivedPages = Math.ceil((profileUser?.receivedCount || 0) / ITEMS_PER_PAGE) || 1;

    const handleOpenGift = (gift: GiftType, variant: 'sent' | 'received') => {
        setSelectedGift(gift);
        setModalVariant(variant);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied!");
    };

    // Check if we should show sent tab
    const showSent = profileUser?.settings?.show_gift_sent !== false;

    if (loadingUser) {
        return <div className="min-h-screen flex items-center justify-center bg-[#E3F4FF]"><Loader2 className="animate-spin text-slate-900" size={48} /></div>;
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#E3F4FF] gap-4">
                <h1 className="text-4xl font-black text-slate-900">User Not Found</h1>
                <p className="text-slate-600 font-medium">We couldn't find a user with the username @{username}</p>
            </div>
        );
    }

    const formatAddress = (address: string) => {
        return (
            <div className="flex items-center gap-2">
                <span className="font-mono text-slate-500 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <span className="md:hidden">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                    <span className="hidden md:inline">{`${address.slice(0, 12)}...${address.slice(-10)}`}</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(address); }}
                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <Copy size={12} />
                </button>
            </div>
        );
    };


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

            {/* <button
                onClick={onShowBreakdown}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-[3px] border-slate-900 shadow-[4px_4px_0_0_#cbd5e1] active:translate-y-[3px] active:shadow-none"
            >
                DETAILS
            </button> */}
        </div>
    );

    return (
        <div className="min-h-screen pb-20 font-['Lilita_One'] text-slate-900 bg-[#E3F4FF]">
            {/* Banner Section */}
            <div className="h-48 md:h-64 w-full bg-slate-200 relative overflow-hidden border-b-[4px] border-slate-900">
                {profileUser.banner ? (
                    <img src={profileUser.banner} alt="Profile Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-[#A5F3FC]">
                        <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}></div>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10 space-y-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-start gap-8">
                    <div className="relative group w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-white relative border-[5px] border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)] overflow-hidden">
                            <Avatar className="w-full h-full">
                                <AvatarImage
                                    src={profileUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=santa"}
                                    alt="Avatar"
                                    className="object-cover bg-white"
                                />
                                <AvatarFallback className="text-4xl font-black bg-slate-200">
                                    {profileUser.username[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            className="absolute -top-2 -right-2 bg-[#FDE047] text-slate-900 p-2 rounded-full border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] z-10"
                        >
                            <Sparkles size={20} fill="currentColor" />
                        </motion.div>
                    </div>

                    <div className="flex-1 pt-6 md:pt-20 space-y-6 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl text-slate-900 drop-shadow-sm leading-tight">
                                    @{profileUser.username.toUpperCase()}
                                </h1>
                                <div className="mt-2 flex items-center gap-2">
                                    {profileUser.address && formatAddress(profileUser.address)}
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {profileUser.bio && profileUser.bio.length > 0 && (
                            <div className="font-lexend text-slate-600 font-medium leading-relaxed max-w-2xl md:max-w-lg bg-white/50 p-4 rounded-xl border-2 border-slate-200/50 backdrop-blur-sm">
                                {profileUser.bio.map((paragraph, index) => (
                                    <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                                ))}

                                {/* Social Icons */}
                                {profileUser.socials && profileUser.socials.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t-2 border-slate-100">
                                        {profileUser.socials.map((social, index) => (
                                            <a
                                                key={index}
                                                href={social.link}
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

                        {/* CTA */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsGiftModalOpen(true)}
                            className="w-full md:w-auto px-8 py-3 bg-[#F472B6] text-slate-900 rounded-2xl font-black text-xl border-[3px] border-slate-900 shadow-[5px_5px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[5px] transition-all flex items-center justify-center gap-3"
                        >
                            <Heart className="fill-pink-700" size={24} />
                            SEND A GIFT
                        </motion.button>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatsCard
                        icon={<ArrowUpRight size={28} className="text-slate-900" />}
                        label="Total Sent"
                        value={`$${(profileUser?.totalSentUSD)?.toLocaleString() || 0}`}
                        color="bg-[#60A5FA]"
                        onShowBreakdown={() => { }}
                    />
                    <StatsCard
                        icon={<ArrowDownLeft size={28} className="text-slate-900" />}
                        label="Total Received"
                        value={`${receivedMeta?.total || 0} Gifts`}
                        color="bg-[#4ADE80]"
                        onShowBreakdown={() => { }}
                    />
                </section>

                {/* Tables Content */}
                <section className="flex flex-col gap-12 font-sans">

                    {/* SENT GIFTS (Only if allowed) */}
                    {showSent && (
                        <TableCard title={`${profileUser.username}'s Sent Gifts`} color="bg-[#60A5FA]" icon={<ArrowUpRight size={20} className="text-slate-900" />}>
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
                                            <tr key={gift._id} onClick={() => handleOpenGift(gift, 'sent')} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <td className="py-4 pl-4">
                                                    {formatAddress(gift.receiverWallet || '')}
                                                </td>
                                                <td className="py-4 font-bold">{gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol.toUpperCase()}`}</td>
                                                <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                                <td className="py-4"><StatusBadge status={gift.status || 'sent'} /></td>
                                            </tr>
                                        ))}
                                        {!isGiftLoading && sentGifts.length === 0 && (
                                            <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-medium">No gifts visible.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {totalSentPages > 1 && (
                                <PaginationControls page={sentPage} totalPages={totalSentPages} setPage={setSentPage} />
                            )}
                        </TableCard>
                    )}

                    {/* RECEIVED GIFTS (Always visible) */}
                    <TableCard title={`${profileUser.username}'s Received Gifts`} color="bg-[#4ADE80]" icon={<ArrowDownLeft size={20} className="text-slate-900" />}>
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
                                    ) : receivedGifts.map((gift, i) => (
                                        <tr key={i} onClick={() => handleOpenGift(gift, 'received')} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="py-4 pl-4">
                                                {formatAddress(gift.senderWallet || '')}
                                            </td>
                                            <td className="py-4 font-bold">{gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol?.toUpperCase()}`}</td>
                                            <td className="py-4 text-slate-500 text-xs font-bold uppercase">{new Date(gift.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4"><StatusBadge status={gift.status || 'sent'} /></td>
                                        </tr>
                                    ))}
                                    {!isGiftLoading && receivedGifts.length === 0 && (
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
            </div>

            {/* Modals */}
            {profileUser && (
                <SendGiftModal
                    isOpen={isGiftModalOpen}
                    onClose={() => setIsGiftModalOpen(false)}
                    initialRecipient={{ address: profileUser.address, username: profileUser.username }}
                />
            )}
            {selectedGift && (
                <GiftRevealModal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    gift={selectedGift}
                    variant={modalVariant}
                />
            )}
        </div>
    );
};

// UI Components
// UI Components

const TableCard = ({ title, icon, color, children }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-[2.5rem] rounded-tl-none p-8 border-[4px] border-slate-900 shadow-[10px_10px_0_0_rgba(15,23,42,1)] w-full relative overflow-hidden">
        {/* Decorative corner stripe */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-20 -mr-10 -mt-10 rounded-full blur-3xl pointer-events-none`}></div>
        {/* Title Header */}
        <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`p-3 ${color} rounded-xl border-[3px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]`}>
                {icon}
            </div>
            <h3 className=" text-xl md:text-3xl font-['Lilita_One'] text-slate-900 tracking-wide">{title}</h3>
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

export default PublicProfile;
