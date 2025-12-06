import React, { useState } from 'react';
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

// Helper to generate mock data
const generateData = (type: 'sent' | 'received', count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        // Use wallet addresses
        address: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        amount: `${(Math.random() * 100).toFixed(2)} ${Math.random() > 0.5 ? 'SUI' : 'SOL'}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        status: Math.random() > 0.3 ? 'Opened' : 'Unopened'
    }));
};

const UNOPENED_GIFTS = [
    { id: 1, sender: "Alice", amount: "50 SUI", color: "from-pink-300 to-rose-300" },
    { id: 2, sender: "Bob", amount: "10 SOL", color: "from-purple-300 to-indigo-300" },
    { id: 3, sender: "Charlie", amount: "25 SUI", color: "from-yellow-300 to-orange-300" },
    { id: 4, sender: "Diana", amount: "100 SOL", color: "from-emerald-300 to-teal-300" },
];

const SENT_GIFTS = generateData('sent', 30);
const RECEIVED_GIFTS = generateData('received', 30);

const ITEMS_PER_PAGE = 15;

const Profile = () => {
    const [activeBreakdown, setActiveBreakdown] = useState<'sent' | 'received' | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

    // Pagination States
    const [sentPage, setSentPage] = useState(1);
    const [receivedPage, setReceivedPage] = useState(1);

    // Pagination Helpers
    const getPaginatedData = (data: typeof SENT_GIFTS, page: number) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const totalSentPages = Math.ceil(SENT_GIFTS.length / ITEMS_PER_PAGE);
    const totalReceivedPages = Math.ceil(RECEIVED_GIFTS.length / ITEMS_PER_PAGE);

    // Address Helper
    const formatAddress = (address: string) => {
        return (
            <span className="font-mono text-slate-600">
                <span className="md:hidden">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                <span className="hidden md:inline">{address}</span>
            </span>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied!");
    };

    return (
        <div className="min-h-screen pb-20 font-['Lilita_One'] text-slate-700">
            <div className="max-w-5xl mx-auto px-6 pt-12 space-y-16">

                {/* 1. Top Section */}
                <header className="flex flex-col md:flex-row items-center gap-8 mt-12">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg rotate-3 transition-transform group-hover:rotate-0 duration-300">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=santa"
                                alt="Avatar"
                                className="w-full h-full rounded-full bg-blue-100"
                            />
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            className="absolute -top-2 -right-2 bg-yellow-300 text-yellow-800 p-2 rounded-full shadow-sm"
                        >
                            <Sparkles size={20} />
                        </motion.div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-5xl md:text-6xl text-blue-900 drop-shadow-sm">Your Gifts</h1>
                        <p className="text-xl font-lexend text-blue-600/80 font-medium tracking-wide">
                            Track everything you’ve sent and received, all wrapped with love ✨
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsGiftModalOpen(true)}
                            className="mt-4 font-lexend px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-bold shadow-lg shadow-pink-200/50 flex items-center gap-2 mx-auto md:mx-0 animate-pulse hover:animate-none transition-all"
                        >
                            <Heart className="fill-white" size={20} />
                            Gift Someone
                        </motion.button>
                    </div>
                </header>

                {/* 2. Unopened Gifts Gallery */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Gift className="text-pink-500" />
                        <h2 className="text-2xl text-blue-800 ">Waiting for you...</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {UNOPENED_GIFTS.map((gift) => (
                            <motion.div
                                key={gift.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={`aspect-square rounded-3xl bg-gradient-to-br ${gift.color} shadow-lg shadow-blue-200/50 relative cursor-pointer group overflow-hidden`}
                            >
                                {/* Ribbon Effect */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-4 bg-white/30 absolute rotate-45 transform group-hover:rotate-12 transition-transform duration-500"></div>
                                    <div className="w-4 h-full bg-white/30 absolute rotate-45 transform group-hover:-rotate-12 transition-transform duration-500"></div>
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-lg">From {gift.sender}</span>
                                    <span className="text-2xl">{gift.amount}</span>
                                </div>

                                <div className="absolute bottom-4 right-4 text-white/80 animate-pulse">
                                    <Sparkles size={24} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. Stats Row */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatsCard
                        icon={<ArrowUpRight className="text-blue-500" />}
                        label="Total Sent"
                        value="$1,250.00"
                        color="bg-blue-50"
                        onShowBreakdown={() => setActiveBreakdown('sent')}
                    />
                    <StatsCard
                        icon={<ArrowDownLeft className="text-green-500" />}
                        label="Total Received"
                        value="$850.00"
                        color="bg-green-50"
                        onShowBreakdown={() => setActiveBreakdown('received')}
                    />
                </section>

                {/* 5. Tables Section (Updated to Full Width Stacked) */}
                <section className="flex flex-col gap-12 font-sans">

                    {/* Sent Gifts Table */}
                    <TableCard title="Gifts You Sent" icon={<ArrowUpRight size={20} className="text-blue-500" />}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend">
                                <thead className="text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-medium min-w-[200px]">To</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {getPaginatedData(SENT_GIFTS, sentPage).map((gift) => (
                                        <tr key={gift.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 pl-4 font-medium flex items-center gap-2">
                                                {formatAddress(gift.address)}
                                                <button
                                                    onClick={() => copyToClipboard(gift.address)}
                                                    className="p-1 hover:bg-blue-100 rounded-md text-blue-400 hover:text-blue-600 transition-colors"
                                                    title="Copy Address"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-3">{gift.amount}</td>
                                            <td className="py-3 text-slate-400">{gift.date}</td>
                                            <td className="py-3">
                                                <StatusBadge status={gift.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalSentPages > 1 && (
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setSentPage(p => Math.max(1, p - 1))}
                                    disabled={sentPage === 1}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold text-slate-500">
                                    Page {sentPage} of {totalSentPages}
                                </span>
                                <button
                                    onClick={() => setSentPage(p => Math.min(totalSentPages, p + 1))}
                                    disabled={sentPage === totalSentPages}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </TableCard>

                    {/* Received Gifts Table */}
                    <TableCard title="Gifts You Received" icon={<ArrowDownLeft size={20} className="text-green-500" />}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-lexend">
                                <thead className="text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="pb-3 pl-4 font-medium min-w-[200px]">From</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {getPaginatedData(RECEIVED_GIFTS, receivedPage).map((gift) => (
                                        <tr key={gift.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 pl-4 font-medium flex items-center gap-2">
                                                {formatAddress(gift.address)}
                                                <button
                                                    onClick={() => copyToClipboard(gift.address)}
                                                    className="p-1 hover:bg-blue-100 rounded-md text-blue-400 hover:text-blue-600 transition-colors"
                                                    title="Copy Address"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </td>
                                            <td className="py-3">{gift.amount}</td>
                                            <td className="py-3 text-slate-400">{gift.date}</td>
                                            <td className="py-3">
                                                <StatusBadge status={gift.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalReceivedPages > 1 && (
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setReceivedPage(p => Math.max(1, p - 1))}
                                    disabled={receivedPage === 1}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold text-slate-500">
                                    Page {receivedPage} of {totalReceivedPages}
                                </span>
                                <button
                                    onClick={() => setReceivedPage(p => Math.min(totalReceivedPages, p + 1))}
                                    disabled={receivedPage === totalReceivedPages}
                                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </TableCard>
                </section>

                {/* 6. Small Description Box */}
                <div className="bg-blue-100/50 rounded-2xl p-6 text-center max-w-2xl mx-auto border border-blue-200/50">
                    <p className="text-blue-800/70 text-lg leading-relaxed">
                        “GiftChain makes sending crypto gifts warm, personal, and memorable. Wrap your love, write a message, and let someone open joy straight from their wallet.”
                    </p>
                </div>

            </div>

            {/* 4. Breakdown Modal (Unified for both types) */}
            <AnimatePresence>
                {activeBreakdown && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveBreakdown(null)}
                            className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center space-y-6"
                        >
                            <button
                                onClick={() => setActiveBreakdown(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            <div className="space-y-2">
                                <h3 className="text-2xl text-slate-800">
                                    {activeBreakdown === 'sent' ? 'Sent Gifts Summary' : 'Received Gifts Summary'}
                                </h3>
                                <p className="text-slate-500 font-sans">
                                    {activeBreakdown === 'sent' ? "You're spreading so much joy! 💖" : "Look at all this love! 🎁"}
                                </p>
                            </div>

                            <div className="py-6 space-y-6">
                                <div>
                                    <div className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-sm font-['Lilita_One']">
                                        {activeBreakdown === 'sent' ? '$1,250' : '$850'}
                                    </div>
                                    <div className="text-slate-400 text-sm font-sans font-medium mt-2 uppercase tracking-widest">
                                        Total Value {activeBreakdown === 'sent' ? 'Sent' : 'Received'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-bold text-slate-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                        {activeBreakdown === 'sent' ? SENT_GIFTS.length : RECEIVED_GIFTS.length} Gifts
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                        {activeBreakdown === 'sent' ? '🚀' : '🎁'}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-sans font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                                <Download size={18} />
                                Download as Image
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
        </div>
    );
};

// Helper Components

const StatsCard = ({ icon, label, value, color, onShowBreakdown }: { icon: React.ReactNode, label: string, value: string, color: string, onShowBreakdown: () => void }) => (
    <div className={`bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
                {icon}
            </div>
            <div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-sans font-bold">{label}</div>
                <div className="text-2xl text-slate-700">{value}</div>
            </div>
        </div>

        <button
            onClick={onShowBreakdown}
            className="bg-white/50 hover:bg-white text-slate-500 hover:text-blue-600 px-4 py-2 rounded-full font-sans text-sm font-bold transition-all border border-transparent hover:border-blue-100 shadow-sm"
        >
            Show Breakdown
        </button>
    </div>
);

const TableCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/50 w-full">
        <div className="flex items-center gap-3 mb-8 text-slate-700">
            <div className="p-2 bg-white rounded-xl shadow-sm">
                {icon}
            </div>
            <h3 className="text-2xl font-['Lilita_One']">{title}</h3>
        </div>
        {children}
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isOpened = status === "Opened";
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${isOpened
            ? "bg-green-100 text-green-600"
            : "bg-yellow-100 text-yellow-600"
            }`}>
            {isOpened && <Check size={12} />}
            {status}
        </span>
    );
};

export default Profile;
