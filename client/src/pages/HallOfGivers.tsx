import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaXTwitter, FaYoutube, FaGift } from 'react-icons/fa6';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import SOLANA from '@/assets/solana.png'
import SUI from '@/assets/sui.png'
import { useAuthActions } from '@/store';
import useAuthStore from '@/store/useAuthStore';
import InfiniteScroll from 'react-infinite-scroll-component';
import SocialIconDetector, { detectPlatform } from '@/components/SocialIconDetector';
import truncateSmart from '@/lib/truncateSmart';

export default function HallOfGivers() {

    const { topGivers, topGiversMeta } = useAuthStore((state) => state);
    const { fetchTopGivers } = useAuthActions();

    useEffect(() => {
        fetchTopGivers();
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF0F5] relative font-jua">

            {/* --- Background Decor --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-300 rounded-full blur-[100px] opacity-40 mix-blend-multiply"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-pink-300 rounded-full blur-[120px] opacity-40 mix-blend-multiply"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 mt-0 pt-24">

                {/* --- Header --- */}
                <header className="text-center mb-12 space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        <h1 className="font-['Lilita_One'] text-6xl md:text-8xl text-pink-500 drop-shadow-[4px_4px_0px_white] rotate-2 inline-block">
                            HALL OF GIVERS
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl text-slate-600 max-w-2xl mx-auto font-jua"
                    >
                        Celebrating the legends who spread the most joy. <br />
                        <span className="text-pink-400">Not earning. Just giving.</span>
                    </motion.p>
                </header>

                {/* --- The List --- */}
                <div className="max-w-[650px]  mx-auto ">
                    <InfiniteScroll
                        dataLength={topGivers.length} //This is important field to render the next data
                        next={fetchTopGivers}
                        hasMore={false}
                        loader={<h4>Loading...</h4>}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>
                        }
                        // below props only if you need pull down functionality
                        refreshFunction={fetchTopGivers}
                        pullDownToRefresh
                        pullDownToRefreshThreshold={50}
                        pullDownToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                        }
                        className='flex flex-col gap-6'
                    >
                        {topGivers.map((giver, index) => (
                            !giver.username.includes("gc@") ? <GiverCard key={giver._id} giver={giver} index={index} /> : null
                        ))}
                    </InfiniteScroll>
                </div>

                {/* --- Footer Note --- */}
                <div className="mt-20 text-center">
                    <p className="text-slate-400 text-lg">“We make a living by what we get, but we make a life by what we give.”</p>
                </div>
            </div>
        </div>
    );
}
//TODO : Update in Server If i can optimize the image of banner and avatar and sent to cloudinary

function GiverCard({ giver, index }: { giver: any; index: number }) {
    const navigate = useNavigate();
    const isTopGiver = index === 0;

    const cardStyles = isTopGiver
        ? "bg-yellow-300 shadow-md"
        : "bg-white border-slate-200 hover:border-pink-200";

    const username = giver.username.replace('@', '');

    const chain = giver.chain; // "sol" | "sui"


    return (
        <motion.div
            onClick={() => navigate(`/${username}`)}

            whileTap={{ scale: 0.98 }}
            className={`
                relative w-full rounded-2xl border-2 cursor-pointer
                transition-all overflow-hidden
                ${cardStyles} 
            `}
        >
            {/* ───────── Chain Header ───────── */}
            <div
                className={`
        w-full h-8 flex items-center justify-center gap-2
        text-xs font-bold tracking-widest
        ${chain === "sol" ? "bg-black text-white" : "bg-blue-500 text-white"}
    `}
            >
                <img
                    src={chain === "sol" ? SOLANA : SUI}
                    alt={chain === "sol" ? "Solana" : "Sui"}
                    className="h-5 w-5 object-contain"
                />

                <span>
                    {chain === "sol" ? "SOLANA" : "SUI"}
                </span>
            </div>


            {/* ───────── Card Body ───────── */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar
                            className={`w-14 h-14 sm:w-16 sm:h-16 border-2 ${isTopGiver
                                ? "border-amber-300 ring-2 ring-amber-100"
                                : "border-white shadow-sm"
                                }`}
                        >
                            <AvatarImage src={giver.avatar} />
                            <AvatarFallback className="font-main text-white bg-gray-500">
                                {giver.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {isTopGiver && (
                            <div className="absolute -bottom-2 right-[50%] translate-x-1/2 bg-pink-400 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                                GIVER
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-start gap-1">
                        <h3 className="text-lg sm:text-2xl font-main leading-wider text-slate-800 mb-1">
                            @{giver.username}
                        </h3>

                        {/* Socials */}
                        <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {
                                giver.socials.map((s: any) => (
                                    <SocialLink
                                        href={s.link}
                                        icon={<SocialIconDetector url={s.link} className="!w-4 !h-4" />}
                                    />
                                ))
                            }

                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="text-right">
                    <div className={`text-xl sm:text-3xl font-main ${giver.chain === 'sol' ? 'text-black' : 'text-blue-500'}`}>
                        ${truncateSmart(giver.totalSentUSD).toLocaleString()}
                    </div>
                    <div className={`text-xs font-main text-slate-400 uppercase tracking-wider mt-0.5 ${isTopGiver ? '!text-black' : ''}`}>
                        sent
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


function normalizeUrl(url: string) {
    if (!url) return "#";

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `https://${url}`;
}


function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    let colors: Record<string, string> = {
        instagram: 'hover:text-pink-500',
        x: 'hover:text-black',
        youtube: 'hover:text-red-500',
        discord: 'hover:text-blue-500',
        telegram: 'hover:text-blue-500',
    }

    let platform = detectPlatform(href);

    return (
        <a
            href={normalizeUrl(href)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-slate-400 transition-colors ${colors[platform]} text-[14px]`}
        >
            {icon}
        </a>
    );
}