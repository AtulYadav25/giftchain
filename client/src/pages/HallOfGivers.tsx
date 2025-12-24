import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Instagram, Twitter, MessageCircle, Youtube, Heart, Gift } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';

// --- MOCK DATA ---
const GIVERS = [
    {
        id: 1,
        name: "SLOVI",
        handle: "@slovi",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=slovionsui",
        address: "0x71C...9A2",
        giftsSent: 420,
        totalAmount: 15400,
        socials: { twitter: "https://x.com/SloviOnSui", instagram: "https://instagram.com" }
    },
    {
        id: 2,
        name: "SuiSweetie",
        handle: "@glitter_queen",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
        address: "0x89B...1B3",
        giftsSent: 89,
        totalAmount: 8200,
        socials: { snapchat: "https://snapchat.com", youtube: "https://youtube.com" }
    },
    {
        id: 3,
        name: "SUISanta",
        handle: "@sui_santa",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=santasui",
        address: "0x22F...C90",
        giftsSent: 155,
        totalAmount: 6750,
        socials: { twitter: "https://x.com", youtube: "https://youtube.com" }
    },
    {
        id: 4,
        name: "GigaChad",
        handle: "@giga_chad",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=gigachad",
        address: "0xA11...F44",
        giftsSent: 30,
        totalAmount: 4200,
        socials: { instagram: "https://instagram.com" }
    },
    {
        id: 5,
        name: "NFTLover",
        handle: "@nft_lover",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=nftlover",
        address: "0xB22...A99",
        giftsSent: 210,
        totalAmount: 3900,
        socials: { twitter: "https://x.com", snapchat: "https://snapchat.com" }
    },
    {
        id: 6,
        name: "SUIPixel",
        handle: "@sui_pixel",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=suipixel",
        address: "0xC33...D88",
        giftsSent: 66,
        totalAmount: 2100,
        socials: { youtube: "https://youtube.com" }
    }
];

export default function HallOfGivers() {
    // Sort by amount
    const sortedGivers = [...GIVERS].sort((a, b) => b.totalAmount - a.totalAmount);

    return (
        <div className="min-h-screen bg-[#FFF0F5] relative overflow-x-hidden font-jua">

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

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 mt-24">

                {/* --- Header --- */}
                <header className="text-center mb-16 space-y-4">
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

                {/* --- The Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedGivers.map((giver, index) => (
                        <GiverCard key={giver.id} giver={giver} index={index} />
                    ))}
                </div>

                {/* --- Footer Note --- */}
                <div className="mt-20 text-center">
                    <p className="text-slate-400 text-lg">“We make a living by what we get, but we make a life by what we give.”</p>
                </div>
            </div>
        </div>
    );
}

function GiverCard({ giver, index }: { giver: any, index: number }) {
    const isTop3 = index < 3;

    const handleCopy = () => {
        navigator.clipboard.writeText(giver.address);
        toast.success("Copied Address!", { icon: "📋" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1 }}
            className={`
                relative bg-white rounded-[2.5rem] p-6 
                border-4 ${isTop3 ? 'border-yellow-400' : 'border-blue-100'}
                shadow-[8px_8px_0px_rgba(0,0,0,0.05)]
                flex flex-col gap-4 group
            `}
        >
            {/* Rank Badge (Cute) */}
            {isTop3 && (
                <div className="absolute -top-6 -right-6 rotate-12 bg-yellow-400 text-yellow-900 w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 border-white shadow-lg z-20">
                    #{index + 1}
                </div>
            )}

            {/* Header: Avatar + Info */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-pink-100 bg-pink-50">
                        <AvatarImage src={giver.avatar} />
                        <AvatarFallback>{giver.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* Tiny heart badge */}
                    <div className="absolute -bottom-1 -right-1 bg-red-400 text-white p-1.5 rounded-full border-2 border-white">
                        <Heart size={14} fill="currentColor" />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <h3 className="font-['Lilita_One'] text-2xl text-slate-800 truncate">{giver.name}</h3>
                    <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 mt-1 w-fit hover:bg-slate-200 transition-colors">
                        <span className="text-slate-500 text-sm font-mono truncate max-w-[80px]">{giver.address}</span>
                        <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600">
                            <Copy size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Block */}
            <div className="bg-[#F0F9FF] rounded-3xl p-4 flex justify-between items-center border-2 border-[#E0F2FE]">
                <div className="text-center">
                    <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Gifts Sent</div>
                    <div className="text-2xl font-black text-blue-500 flex items-center justify-center gap-1">
                        <Gift size={20} className="mb-1" /> {giver.giftsSent}
                    </div>
                </div>
                <div className="w-[2px] h-10 bg-blue-100 rounded-full" />
                <div className="text-center">
                    <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Value</div>
                    <div className="text-2xl font-black text-green-500">
                        ${giver.totalAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Socials Row */}
            <div className="flex gap-2 justify-center pt-2">
                {giver.socials.twitter && (
                    <SocialIcon icon={<Twitter size={18} />} label="This is X (Twitter)" color="bg-black text-white" />
                )}
                {giver.socials.instagram && (
                    <SocialIcon icon={<Instagram size={18} />} label="This is Instagram" color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white" />
                )}
                {giver.socials.snapchat && (
                    <SocialIcon icon={<MessageCircle size={18} />} label="This is Snapchat" color="bg-yellow-400 text-white" />
                )}
                {giver.socials.youtube && (
                    <SocialIcon icon={<Youtube size={18} />} label="This is YouTube" color="bg-red-600 text-white" />
                )}
            </div>
        </motion.div>
    );
}

function SocialIcon({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap z-50 pointer-events-none font-bold"
                    >
                        {label}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                    </motion.div>
                )}
            </AnimatePresence>

            <button className={`w-10 h-10 ${color} rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md`}>
                {icon}
            </button>
        </div>
    );
}
