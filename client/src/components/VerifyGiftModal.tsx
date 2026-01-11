import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGiftActions, useUser } from '@/store';
import type { Gift } from '@/types/gift.types';

interface VerifyGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    gift: Gift | null;
}

export default function VerifyGiftModal({ isOpen, onClose, gift }: VerifyGiftModalProps) {
    const [txDigest, setTxDigest] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { verifyGift, fetchSentGifts } = useGiftActions();
    const user = useUser();

    const handleVerify = async () => {
        if (!gift || !user?.address || !txDigest.trim()) {
            toast.error("Please enter a transaction digest");
            return;
        }

        setIsVerifying(true);
        try {
            await verifyGift({
                giftIds: [gift._id],
                txDigest: txDigest.trim(),
                address: user.address,
                verifyType: 'wrapGift',
            });

            toast.success("Gift verified successfully!");
            // Refresh sent gifts to update the list
            fetchSentGifts(user.address, 1, 8);
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to verify gift");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen || !gift) return null;

    return (
        <AnimatePresence>
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
                    className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[16px_16px_0_0_rgba(15,23,42,1)] border-[4px] border-slate-900 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b-[4px] border-slate-900 flex justify-between items-center bg-[#FDE047] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:12px_12px]"></div>
                        <h2 className="text-2xl font-['Lilita_One'] text-slate-900 flex items-center gap-2 relative z-10 tracking-wide">
                            <KeyRound className="text-slate-900" strokeWidth={2.5} />
                            Verify Gift
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white border-2 border-slate-900 text-slate-900 hover:scale-110 active:scale-95 transition-all rounded-full shadow-[2px_2px_0_0_rgba(15,23,42,1)] relative z-10"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm text-slate-600 font-lexend">
                            <p className="mb-2 font-bold text-slate-800">Why verify manually?</p>
                            <p>Sometimes transactions go through on the blockchain but our system misses the update. Enter the Transaction Digest (Signature) below to manually verify this gift.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider font-lexend">
                                Transaction Digest
                            </label>
                            <input
                                type="text"
                                value={txDigest}
                                onChange={(e) => setTxDigest(e.target.value)}
                                placeholder="Enter Tx Signature..."
                                className="w-full p-4 rounded-xl bg-white border-[3px] border-slate-200 focus:border-slate-900 focus:ring-0 transition-all placeholder:text-slate-300 text-slate-700 font-medium font-mono"
                            />
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={isVerifying || !txDigest}
                            className="w-full py-4 bg-[#4ADE80] text-slate-900 rounded-xl font-bold border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed font-lexend"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="animate-spin" strokeWidth={3} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Check className="text-slate-900" strokeWidth={4} />
                                    VERIFY NOW
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
