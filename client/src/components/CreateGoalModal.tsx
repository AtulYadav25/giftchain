import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Sparkles, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGoalModal = ({ isOpen, onClose }: CreateGoalModalProps) => {
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!heading || !description || !amount) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        // Mock API Call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Split description by newlines to simulate paragraphs
        const paragraphs = description.split('\n').filter(p => p.trim() !== '');

        console.log({
            heading,
            paragraphs,
            amount: Number(amount)
        });

        toast.success("Goal Created Successfully!");
        setIsLoading(false);
        onClose();
        // Reset
        setHeading('');
        setDescription('');
        setAmount('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 100 }}
                        className="relative bg-white w-full max-w-lg rounded-[2.5rem] border-[5px] border-slate-900 shadow-[10px_10px_0_0_rgba(15,23,42,1)] overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="bg-[#FFD166] p-6 border-b-[4px] border-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]">
                                    <Target size={24} className="text-slate-900" />
                                </div>
                                <h2 className="text-2xl font-['Lilita_One'] text-slate-900 tracking-wide">Create Goal</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white border-2 border-slate-900 rounded-full hover:bg-slate-100 transition-colors shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Goal Heading */}
                            <div className="space-y-2">
                                <label className="block font-black text-slate-900 uppercase tracking-wider text-xs ml-1">Goal Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. New Camera Lens 📸"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-[#FFD166] rounded-xl px-4 py-3 font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block font-black text-slate-900 uppercase tracking-wider text-xs ml-1">Description</label>
                                <textarea
                                    placeholder="Tell your supporters why this matters..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-[#FFD166] rounded-xl px-4 py-3 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors resize-none"
                                />
                                <p className="text-xs text-slate-400 font-bold ml-1">Paragraphs are preserved.</p>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="block font-black text-slate-900 uppercase tracking-wider text-xs ml-1">Target Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                    <input
                                        type="number"
                                        placeholder="1000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-[#FFD166] rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                className="w-full bg-[#4ADE80] text-slate-900 border-[3px] border-slate-900 py-4 rounded-xl font-black text-xl shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>Loading...</>
                                ) : (
                                    <>
                                        <Rocket size={24} />
                                        GO LIVE
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateGoalModal;
