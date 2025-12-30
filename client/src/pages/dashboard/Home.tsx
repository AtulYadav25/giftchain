import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight, ArrowDownLeft, Gift, Sparkles } from 'lucide-react';
import { useUser } from '@/store';
import { useSentMeta, useReceivedMeta } from '@/store/useGiftStore';
import SendGiftModal from '@/components/SendGiftModal';

const DashboardHome = () => {
    const user = useUser();
    const sentMeta = useSentMeta();
    const receivedMeta = useReceivedMeta();
    const [isGiftModalOpen, setIsGiftModalOpen] = React.useState(false);

    // Mock Goal Data
    const activeGoal = {
        title: "New Mac Studio for Coding 🖥️",
        description: "I'm building GiftChain day and night! My current laptop is struggling to keep up with all the compiling. Help me upgrade so I can ship features faster!",
        raised: 1250,
        target: 3000,
        isLive: true
    };

    const progress = (activeGoal.raised / activeGoal.target) * 100;

    return (
        <div className="space-y-12">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] border-[4px] border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full blur-[80px] opacity-40 -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-[4px] border-slate-900 overflow-hidden shadow-[4px_4px_0_0_rgba(15,23,42,1)] bg-white">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Floating Sparkle */}
                    <div className="absolute -top-3 -right-3 bg-[#FDE047] p-2 rounded-full border-[3px] border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] animate-bounce">
                        <Sparkles size={20} className="text-slate-900" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
                    <h2 className="text-4xl font-['Lilita_One'] text-slate-900 tracking-wide">
                        Welcome back, <span className="text-[#3B82F6]">{user?.username || 'Friend'}</span>!
                    </h2>
                    <p className="font-lexend text-slate-500 font-medium text-lg">
                        Ready to spread some joy today? 🎁
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsGiftModalOpen(true)}
                    className="relative z-10 bg-[#F472B6] text-slate-900 border-[3px] border-slate-900 px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all"
                >
                    <Heart className="fill-slate-900" size={24} />
                    Gift Someone
                </motion.button>
            </div>

            {/* 2. Goal Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#1e293b]">
                        <TargetIcon size={24} />
                    </div>
                    <h3 className="text-2xl font-['Lilita_One'] text-slate-900 tracking-wide">ACTIVE GOAL</h3>
                </div>

                <div className="bg-white rounded-[2rem] border-[4px] border-slate-900 p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
                    {/* LIVE badge */}
                    {activeGoal.isLive && (
                        <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full border-2 border-red-600 font-black text-xs uppercase tracking-wider animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            LIVE
                        </div>
                    )}

                    <div className="max-w-3xl">
                        <h4 className="text-2xl font-black text-slate-900 mb-4 font-lexend">{activeGoal.title}</h4>
                        <p className="text-slate-600 font-medium leading-relaxed mb-8 font-lexend text-lg">
                            {activeGoal.description}
                        </p>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end font-black text-slate-900 font-lexend">
                                <span className="text-3xl">${activeGoal.raised.toLocaleString()}</span>
                                <span className="text-slate-400 text-lg">of ${activeGoal.target.toLocaleString()}</span>
                            </div>

                            <div className="h-6 bg-slate-100 rounded-full border-[3px] border-slate-900 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-[#4ADE80] rounded-full relative"
                                >
                                    {/* Stripes pattern */}
                                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"></div>
                                </motion.div>
                            </div>

                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                <span>{progress.toFixed(0)}% Funded</span>
                                <span>${(activeGoal.target - activeGoal.raised).toLocaleString()} TO GO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#E0F2FE] border-[4px] border-slate-900 rounded-[2rem] p-6 flex items-center gap-6 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                    <div className="w-16 h-16 bg-white rounded-2xl border-[3px] border-slate-900 flex items-center justify-center shadow-[3px_3px_0_0_rgba(15,23,42,1)]">
                        <ArrowUpRight size={32} className="text-[#0EA5E9]" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-1">Total Sent</p>
                        <p className="text-4xl font-['Lilita_One'] text-slate-900">${(user?.totalSentUSD || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-[#DCFCE7] border-[4px] border-slate-900 rounded-[2rem] p-6 flex items-center gap-6 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                    <div className="w-16 h-16 bg-white rounded-2xl border-[3px] border-slate-900 flex items-center justify-center shadow-[3px_3px_0_0_rgba(15,23,42,1)]">
                        <ArrowDownLeft size={32} className="text-[#22C55E]" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-1">Total Received</p>
                        <p className="text-4xl font-['Lilita_One'] text-slate-900">{receivedMeta?.total || 0} Gifts</p>
                    </div>
                </div>
            </div>

            <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} />
        </div>
    );
};

const TargetIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export default DashboardHome;