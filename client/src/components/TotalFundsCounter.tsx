

import { motion } from 'framer-motion';
import CountUp from './CountUp'; // Adjust path if needed
import { Sparkles, Heart } from 'lucide-react';
import useGiftStore from '@/store/useGiftStore';
import truncateSmart from '@/lib/truncateSmart';

export default function TotalFundsCounter() {

    const { globalGiftStats } = useGiftStore()

    // Hardcoded values for demonstration
    const totalFunds = Number(truncateSmart(globalGiftStats.totalAmountUSD)); // $12,450,500
    const totalGifts = globalGiftStats.totalGiftsSent;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#F0F9FF] -skew-y-1 transform origin-top-left z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">

                {/* Main Content Container */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(59,130,246,0.1)] rounded-[3rem] p-12 w-full max-w-4xl"
                >
                    {/* Headline with Live Indicator */}
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="flex items-center gap-2 bg-green-100/50 px-3 py-1 rounded-full border border-green-200/50">
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            />
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">On-chain Generosity</span>
                        </div>
                        <h2 className="font-['Lilita_One'] text-4xl md:text-5xl text-slate-800 text-center leading-tight">
                            Wrapped & gifted safely
                        </h2>
                    </div>
                    <p className="font-jua text-xl text-slate-500 mb-8">
                        by the Giftchain Community
                    </p>

                    {/* Big Counter */}
                    <div className="flex flex-col items-center justify-center my-8">
                        <div className="flex items-baseline gap-2 font-['Lilita_One'] text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 drop-shadow-sm">
                            <span className="text-5xl md:text-7xl text-blue-400 mr-1">$</span>
                            <CountUp
                                to={totalFunds}
                                separator=","
                                direction="up"
                                duration={1.2}
                                className="tracking-tight"
                            />
                        </div>

                        {/* Sub-stat: Gift Count */}
                        {totalGifts > 20 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mt-4 flex items-center gap-2 text-slate-400 font-bold font-mono text-sm md:text-base bg-slate-100/50 px-4 py-1.5 rounded-full"
                            >
                                <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
                                Processed {totalGifts.toLocaleString()} gifts
                            </motion.div>
                        )}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mt-4 text-center gap-2 text-slate-800  uppercase font-main text-sm md:text-base bg-slate-100/50 px-4 py-1.5 rounded-full"
                        >
                            <span className='text-pink-600 font-bold'>Giftchain</span> is Trusted by the Crypto Community.
                            <br /> We're <span className='text-pink-600 font-bold'>Growing</span> organically — you’re early.

                        </motion.div>
                    </div>

                    {/* "You're part of this" Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: 2 }}
                        whileHover={{ scale: 1.05, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
                        className="absolute -bottom-6 -right-4 md:-right-10 bg-white p-4 rounded-2xl shadow-xl border-2 border-pink-100 flex items-center gap-3 transform rotate-2 max-w-[200px]"
                    >
                        <div className="bg-pink-100 p-2 rounded-full">
                            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">You’re part of this.</p>
                            <p className="text-[10px] text-slate-400 font-medium">Join the movement</p>
                        </div>
                    </motion.div>

                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 text-blue-200/50 pointer-events-none -z-10">
                    <Sparkles size={64} />
                </div>
                <div className="absolute bottom-10 right-10 text-purple-200/50 pointer-events-none -z-10">
                    <Sparkles size={48} />
                </div>
            </div>
        </section>
    );
}
