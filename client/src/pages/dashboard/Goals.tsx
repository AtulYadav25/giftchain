import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, MoreVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import CreateGoalModal from '@/components/CreateGoalModal';

const DashboardGoals = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Mock Data
    const goals = [
        {
            id: 1,
            title: "New Mac Studio for Coding 🖥️",
            description: "I'm building GiftChain day and night! My current laptop is struggling to keep up with all the compiling. Help me upgrade so I can ship features faster!",
            raised: 1250,
            target: 3000,
            status: 'active',
            createdAt: '2025-10-15'
        },
        {
            id: 2,
            title: "Coffee Fund for the Team ☕",
            description: "Fueling the coding sessions with premium beans.",
            raised: 500,
            target: 500,
            status: 'completed',
            createdAt: '2025-09-01'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-['Lilita_One'] text-slate-900 tracking-wide mb-2">My Goals</h1>
                    <p className="text-slate-500 font-medium font-lexend">Manage your fundraising goals and track progress.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#FFD166] text-slate-900 border-[3px] border-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all"
                >
                    <Plus size={24} strokeWidth={3} />
                    Create New Goal
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {goals.map((goal) => {
                    const progress = Math.min((goal.raised / goal.target) * 100, 100);

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-[2rem] border-[4px] border-slate-900 p-6 shadow-[8px_8px_0_0_rgba(15,23,42,1)] relative group overflow-hidden flex flex-col ${goal.status === 'completed' ? 'opacity-90' : ''}`}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                {goal.status === 'active' ? (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full border-2 border-red-600 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        LIVE
                                    </span>
                                ) : (
                                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full border-2 border-green-600 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle2 size={12} strokeWidth={4} />
                                        DONE
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 mb-2 font-lexend pr-16 leading-tight">{goal.title}</h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-3">{goal.description}</p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end font-black text-slate-900 font-lexend">
                                        <span className="text-2xl">${goal.raised.toLocaleString()}</span>
                                        <span className="text-slate-400 text-sm">of ${goal.target.toLocaleString()}</span>
                                    </div>

                                    <div className="h-4 bg-slate-100 rounded-full border-2 border-slate-900 p-0.5">
                                        <div
                                            style={{ width: `${progress}%` }}
                                            className={`h-full rounded-full ${goal.status === 'completed' ? 'bg-[#4ADE80]' : 'bg-[#FFD166]'} transition-all duration-1000`}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t-2 border-slate-100">
                                    <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-bold text-sm border-2 border-transparent hover:border-slate-900 transition-all flex items-center justify-center gap-2">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-2 border-transparent hover:border-red-600 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
};

export default DashboardGoals;
