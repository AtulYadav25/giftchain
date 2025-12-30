import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Twitter, Instagram, Globe, Heart, Sparkles, Check } from 'lucide-react';
import SendGiftModal from '@/components/SendGiftModal';

const PublicProfile = () => {
    const { username } = useParams<{ username: string }>();
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

    // Mock Public Data
    const publicUser = {
        username: username || "Creator",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'creator'}`,
        bio: "Creating digital art and sharing vibes. Thanks for your support! 🎨✨",
        activeGoal: {
            title: "New Drawing Tablet 🎨",
            description: "My current tablet is giving up on me! Help me upgrade so I can keep creating the art you love. Every bit counts!",
            raised: 450,
            target: 800,
            isLive: true
        }
    };

    const progress = (publicUser.activeGoal.raised / publicUser.activeGoal.target) * 100;

    return (
        <div className="min-h-screen bg-[#FFF0F5] font-['Lilita_One'] pb-20">
            <div className="max-w-3xl mx-auto px-6 py-20 space-y-16">

                {/* 1. Header */}
                <header className="text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="w-40 h-40 rounded-full border-[6px] border-slate-900 bg-white overflow-hidden shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative z-10">
                            <img src={publicUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 text-yellow-400 animate-spin-slow">
                            <Sparkles size={48} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl text-slate-900 drop-shadow-sm leading-tight">
                            {publicUser.username}
                        </h1>
                        <p className="font-lexend text-2xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
                            {publicUser.bio}
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <SocialButton icon={Twitter} />
                        <SocialButton icon={Instagram} />
                        <SocialButton icon={Globe} />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsGiftModalOpen(true)}
                        className="bg-[#F472B6] text-slate-900 border-[3px] border-slate-900 px-10 py-4 rounded-2xl font-black text-2xl shadow-[6px_6px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-3 mx-auto"
                    >
                        <Heart className="fill-slate-900" size={28} />
                        Send Gift
                    </motion.button>
                </header>

                {/* 2. Goal Section */}
                <section className="bg-white rounded-[3rem] border-[5px] border-slate-900 p-10 shadow-[12px_12px_0_0_rgba(15,23,42,1)] relative overflow-hidden text-center md:text-left">
                    {/* Live Badge */}
                    <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-100 text-red-600 px-4 py-1.5 rounded-full border-2 border-red-600 font-black text-sm uppercase tracking-wider animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                        LIVE GOAL
                    </div>

                    <div className="max-w-2xl relative z-10">
                        <h2 className="text-4xl text-slate-900 mb-6">{publicUser.activeGoal.title}</h2>

                        <p className="font-lexend text-xl text-slate-600 font-medium leading-relaxed mb-10">
                            {publicUser.activeGoal.description}
                        </p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end font-black text-slate-900 font-lexend">
                                <span className="text-4xl">${publicUser.activeGoal.raised}</span>
                                <span className="text-slate-400 text-xl">of ${publicUser.activeGoal.target}</span>
                            </div>

                            <div className="h-8 bg-slate-100 rounded-full border-[3px] border-slate-900 p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-[#4ADE80] rounded-full relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"></div>
                                </motion.div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-lexend">
                                    {(publicUser.activeGoal.target - publicUser.activeGoal.raised)} USD TO GO
                                </div>
                                <button
                                    onClick={() => setIsGiftModalOpen(true)}
                                    className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold font-lexend text-sm hover:scale-105 transition-transform"
                                >
                                    Contribute
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <SendGiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} recipientUsername={username} />
            </div>
        </div>
    );
};

const SocialButton = ({ icon: Icon }: { icon: any }) => (
    <button className="p-3 bg-white border-[3px] border-slate-900 rounded-full text-slate-900 hover:scale-110 transition-transform shadow-[3px_3px_0_0_rgba(15,23,42,1)] active:translate-y-[1px] active:shadow-none">
        <Icon size={24} strokeWidth={2.5} />
    </button>
);

export default PublicProfile;
