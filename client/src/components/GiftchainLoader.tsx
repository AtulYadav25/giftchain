import React from 'react';
import { motion } from 'framer-motion';

const GiftchainLoader: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-600/50 text-slate-800">
            <span className="font-['Lilita_One'] text-2xl md:text-5xl text-white drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                GiftChain<span className={`text-blue-200`}>.fun</span>
            </span>

            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <h2 className="text-xl font-['Lilita_One'] tracking-widest text-white/80">
                    Loading...
                </h2>
            </motion.div>
        </div>
    );
};

export default GiftchainLoader;
