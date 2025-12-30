import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownLeft, // Changed from ArrowDownRight as it is not exported, or standard is ArrowDownLeft for receive usually
    Copy,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Check,
    Gift as GiftI
} from 'lucide-react';
import { useUser } from '@/store';
import {
    useSentGifts,
    useReceivedGifts,
    useSentMeta,
    useReceivedMeta,
    useGiftActions,
    useGiftLoading
} from '@/store/useGiftStore';
import toast from 'react-hot-toast';
import GiftRevealModal from '@/components/GiftRevealModal';
import type { Gift } from '@/types/gift.types';

const DashboardGifts = () => {
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
    const [dateFilter, setDateFilter] = useState('Latest');
    const [goalFilter, setGoalFilter] = useState('All Goals');

    const user = useUser();

    // Pagination & Data Loading
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const { fetchSentGifts, fetchReceivedGifts } = useGiftActions();
    const sentGifts = useSentGifts();
    const receivedGifts = useReceivedGifts();
    const sentMeta = useSentMeta();
    const receivedMeta = useReceivedMeta();
    const loading = useGiftLoading();

    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

    useEffect(() => {
        if (!user?.address) return;
        if (activeTab === 'sent') {
            fetchSentGifts(user.address, page, ITEMS_PER_PAGE);
        } else {
            fetchReceivedGifts(user.address, page, ITEMS_PER_PAGE);
        }
    }, [user?.address, activeTab, page]);

    // Derived Logic
    const gifts = activeTab === 'sent' ? sentGifts : receivedGifts;
    const meta = activeTab === 'sent' ? sentMeta : receivedMeta;
    const totalPages = meta?.totalPages || 1;

    const formatAddress = (addr: string) => {
        if (!addr) return 'Unknown';
        if (addr.length < 10) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied!");
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-['Lilita_One'] text-slate-900 tracking-wide mb-2">Gift History</h1>
                    <p className="text-slate-500 font-medium font-lexend">View and manage all your gift transactions</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    {/* Tabs */}
                    <div className="bg-white p-1.5 rounded-xl border-[3px] border-slate-900 flex shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                        <button
                            onClick={() => { setActiveTab('sent'); setPage(1); }}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'sent'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Sent
                        </button>
                        <button
                            onClick={() => { setActiveTab('received'); setPage(1); }}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'received'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Received
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="appearance-none bg-white pl-10 pr-10 py-3 rounded-xl border-[3px] border-slate-900 font-bold text-slate-700 text-sm focus:outline-none shadow-[4px_4px_0_0_rgba(15,23,42,1)] cursor-pointer hover:bg-slate-50"
                            >
                                <option>Latest</option>
                                <option>Last 7 Days</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                                <option>Last Year</option>
                            </select>
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative group">
                            <select
                                value={goalFilter}
                                onChange={(e) => setGoalFilter(e.target.value)}
                                className="appearance-none bg-white pl-10 pr-10 py-3 rounded-xl border-[3px] border-slate-900 font-bold text-slate-700 text-sm focus:outline-none shadow-[4px_4px_0_0_rgba(15,23,42,1)] cursor-pointer hover:bg-slate-50"
                            >
                                <option>All Goals</option>
                                <option>New Mac Studio</option>
                                <option>Coffee Fund</option>
                            </select>
                            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border-[4px] border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b-[3px] border-slate-100">
                            <tr>
                                <th className="py-5 pl-8 font-black text-slate-400 uppercase text-xs tracking-wider">
                                    {activeTab === 'sent' ? 'Recipient' : 'Sender'}
                                </th>
                                <th className="py-5 font-black text-slate-400 uppercase text-xs tracking-wider">Amount</th>
                                <th className="py-5 font-black text-slate-400 uppercase text-xs tracking-wider">Date</th>
                                <th className="py-5 font-black text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="py-5 font-black text-slate-400 uppercase text-xs tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && gifts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                                    </td>
                                </tr>
                            ) : gifts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500 font-lexend font-medium">
                                        No gifts found for this period.
                                    </td>
                                </tr>
                            ) : (
                                gifts.map((gift) => (
                                    <tr
                                        key={gift._id}
                                        onClick={() => setSelectedGift(gift)}
                                        className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="py-5 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${activeTab === 'sent' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                    {activeTab === 'sent' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 font-lexend">
                                                        {activeTab === 'sent'
                                                            ? formatAddress(gift.receiverWallet)
                                                            : formatAddress(gift.senderWallet)
                                                        }
                                                    </p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(activeTab === 'sent' ? gift.receiverWallet : gift.senderWallet); }}
                                                        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-bold"
                                                    >
                                                        Copy Address <Copy size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-5">
                                            <p className="font-black text-slate-900 text-lg">
                                                {gift.amountUSD ? `$${gift.amountUSD}` : `${gift.totalTokenAmount} ${gift.tokenSymbol?.toUpperCase()}`}
                                            </p>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{gift.tokenSymbol?.toUpperCase() || 'SUI'}</p>
                                        </td>

                                        <td className="py-5">
                                            <p className="font-bold text-slate-700">{new Date(gift.createdAt).toLocaleDateString()}</p>
                                            <p className="text-xs text-slate-400 font-bold">{new Date(gift.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>

                                        <td className="py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${gift.status === 'Opened' ? 'bg-[#4ADE80] text-slate-900' : 'bg-[#FDE047] text-slate-900'
                                                }`}>
                                                {gift.status === 'opened' ? <Check size={12} strokeWidth={4} /> : <GiftI size={12} strokeWidth={2.5} />}
                                                {gift.status || 'Sent'}
                                            </span>
                                        </td>

                                        <td className="py-5">
                                            <div className="font-bold text-slate-400 text-sm group-hover:text-blue-500 transition-colors flex items-center gap-1">
                                                View
                                                <ChevronRight size={16} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t-[3px] border-slate-100 bg-slate-50">
                        <p className="text-slate-500 font-bold text-sm">
                            Showing page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!meta?.hasPrevPage}
                                className="p-2 rounded-lg bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-900 hover:text-slate-900 transition-colors shadow-[2px_2px_0_0_#e2e8f0] active:translate-y-[1px] active:shadow-none"
                            >
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={!meta?.hasNextPage}
                                className="p-2 rounded-lg bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-900 hover:text-slate-900 transition-colors shadow-[2px_2px_0_0_#e2e8f0] active:translate-y-[1px] active:shadow-none"
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedGift && (
                <GiftRevealModal
                    isOpen={!!selectedGift}
                    onClose={() => setSelectedGift(null)}
                    gift={selectedGift}
                    variant={activeTab}
                />
            )}
        </div>
    );
};

export default DashboardGifts;
