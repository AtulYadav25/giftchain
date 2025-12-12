import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import mascot from '@/assets/hero/mascot_hero.webp';
import slovi from '@/assets/hero/slovi.png';
import giftFactory from '@/assets/how_it_works/gift_factory.webp';
import { ArrowRight, Gift, Heart, Sparkles, Zap, Smartphone, Link as LinkIcon, Edit } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { allWrappers } from '@/assets/wrappers/wrapperIndex';

// Prepare Wrapper Images for Gallery
const galleryItems = allWrappers.map(w => ({ text: w.name, image: w.image }));

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    return (
        <div ref={containerRef} className="w-full min-h-screen bg-[#E3F4FF] overflow-x-hidden">
            {/* 1. HERO SECTION */}
            <HeroSection navigate={navigate} />

            {/* 2. TICKER MARQUEE */}
            <MarqueeSection />

            {/* 3. HOW IT WORKS (Scroll Reveal) */}
            <HowItWorksSection />

            {/* 4. WRAPPER SHOWCASE */}
            <WrapperShowcaseSection />

            {/* 5. ABOUT / MASCOT */}
            <AboutSection />

            {/* 6. CALL TO ACTION / FOOTER */}
            <FooterSection navigate={navigate} />
        </div>
    );
}

// --- SUB-COMPONENTS ---

function HeroSection({ navigate }: { navigate: any }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden bg-gradient-to-b from-[#2e9aff] to-[#60b6ff]">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <FloatingElement delay={0} x="10%" y="20%"><div className="w-64 h-64 bg-white/10 rounded-full blur-3xl" /></FloatingElement>
                <FloatingElement delay={1} x="80%" y="60%"><div className="w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" /></FloatingElement>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white font-main uppercase font-bold text-sm tracking-wider mb-4 border border-white/30 backdrop-blur-md">
                        ✨ The cutest way to send crypto
                    </span>
                    <h1 className="font-['Lilita_One'] text-6xl md:text-8xl lg:text-9xl text-white drop-shadow-lg leading-[0.9]">
                        UNWRAP <br /> <span className="text-[#a4f4ff]">HAPPINESS</span>
                        <svg className="absolute w-full h-8 -bottom-6 md:-bottom-4 left-0 text-yellow-300
                         opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q50 20 100 10" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-xl md:text-2xl text-blue-50 font-jua max-w-2xl mx-auto leading-relaxed"
                >
                    Send SUI & SOL wrapped in beautiful, animated digital gifts.
                    Add a message, choose a vibe, and make someone’s day.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4"
                >
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-8 py-4 cursor-pointer z-[20] bg-white text-blue-600 rounded-full  font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group"
                    >
                        Send a Gift Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-blue-700/30 text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
                        View Gallery
                    </button>
                </motion.div>
            </div>

            {/* Floating 3D-ish Elements */}
            <motion.div style={{ y: y1 }} className="absolute left-[5%] bottom-[10%] w-[20%] max-w-[200px] hidden md:block">
                <FloatingElement delay={0.2}>
                    <div className="aspect-square bg-gradient-to-br from-pink-300 to-purple-400 rounded-3xl shadow-2xl rotate-12 flex items-center justify-center border-4 border-white/50 backdrop-blur-sm">
                        <Gift className="text-white w-16 h-16" />
                    </div>
                </FloatingElement>
            </motion.div>

            <motion.div style={{ y: y2 }} className="absolute right-[5%] top-[20%] w-[15%] max-w-[150px] hidden md:block">
                <FloatingElement delay={0.5}>
                    <div className="aspect-square bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl -rotate-6 flex items-center justify-center border-4 border-white/50 backdrop-blur-sm">
                        <Sparkles className="text-white w-12 h-12" />
                    </div>
                </FloatingElement>
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#E3F4FF] via-[#E3F4FF]/50 to-transparent z-10" />
        </section>
    );
}

function MarqueeSection() {
    return (
        <div className="bg-blue-900 py-3 overflow-hidden relative z-20 -mt-1 shadow-lg rotate-1 scale-105 border-y-4 border-yellow-300">
            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="flex gap-12 whitespace-nowrap text-white font-bold text-lg items-center"
            >
                {[...Array(10)].map((_, i) => (
                    <React.Fragment key={i}>
                        <span className="flex items-center gap-2"><Heart size={16} className="text-pink-400 fill-pink-400" /> Alice sent 50 SUI</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="flex items-center gap-2"><Gift size={16} className="text-yellow-400" /> Bob wrapped a gift</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="flex items-center gap-2"><Zap size={16} className="text-cyan-400 fill-cyan-400" /> 120 SOL gifted today</span>
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
}

function HowItWorksSection() {
    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const steps = [
        {
            title: "Connect your wallet",
            desc: "Link your SUI or SOL wallet in one click securely."
        },
        {
            title: "Choose your wrapper",
            desc: "Pick from our cute collection of animated gift boxes."
        },
        {
            title: "Write a message",
            desc: "Add a personal note to make it extra special."
        },
        {
            title: "Stuff it with crypto",
            desc: "Add any amount of tokens and send it instantly!"
        }
    ];

    const words = ["Love", "Gifts", "Giveaways"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 px-4 bg-[#E3F4FF] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                    {/* LEFT SIDE: Image + Animated Component */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-8 order-1">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 group">
                            <motion.div
                                initial={{ scale: 1 }}
                                whileInView={{ scale: 1.1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                viewport={{ once: false, margin: "-100px" }}
                                className="w-full aspect-[4/3]"
                            >
                                <img
                                    src={giftFactory}
                                    alt="Gift Factory"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Overlay Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>

                        {/* Custom Animated Text Component */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-blue-100 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl text-slate-500 font-bold font-jua mb-2">Giftchain.fun for Sending</h3>
                            <div className="h-16 overflow-hidden flex items-center justify-center">
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={words[index]}
                                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: -50, opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="text-5xl md:text-6xl font-['Lilita_One'] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block"
                                    >
                                        "{words[index]}"
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Steps */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center order-2">
                        <motion.h2
                            initial="hidden"
                            whileInView="visible"
                            variants={textVariants}
                            transition={{ duration: 0.5 }}
                            className="font-['Lilita_One'] text-5xl text-blue-900 mb-10 text-center lg:text-left"
                        >
                            How It Works
                        </motion.h2>

                        <div className="flex flex-col gap-6">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.15, duration: 0.6, type: "spring" }}
                                    className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border-2 border-white/50 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-2xl font-['Lilita_One'] text-slate-700 mb-2 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-lg flex items-center justify-center shadow-inner">
                                            {i + 1}
                                        </span>
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 font-medium pl-11 text-lg leading-snug">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function WrapperShowcaseSection() {
    return (
        <section className="py-20 relative bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

            <div className="relative z-10 text-center mb-10 text-white">
                <h2 className="font-['Lilita_One'] text-5xl mb-2">Our Wrappers</h2>
                <p className="text-lg opacity-80">Cute, cool, and chaotic. Pick your vibe.</p>
            </div>

            <div className="h-[500px] relative">

                {/* 🔵 Left Blur Blob */}
                <div
                    className="z-[1000] absolute -left-20 top-1/2 -translate-y-1/2 
        w-60 h-60 rounded-full bg-blue-500/30 blur-[120px] 
        pointer-events-none"
                />

                {/* 🟣 Right Blur Blob */}
                <div
                    className="z-[1000] absolute -right-20 top-1/2 -translate-y-1/2 
        w-60 h-60 rounded-full bg-purple-500/30 blur-[120px] 
        pointer-events-none"
                />

                <CircularGallery
                    items={galleryItems}
                    bend={3}
                    textColor="#ffffff"
                    borderRadius={0.05}
                />
            </div>

        </section>
    );
}

function AboutSection() {
    return (
        <section className="relative w-full overflow-hidden bg-white py-24 lg:h-[800px] flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full h-full relative z-10 flex flex-col">

                {/* Text Content */}
                <div className="w-full lg:w-1/2 z-20 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-['Lilita_One'] text-6xl md:text-7xl text-blue-900 leading-tight mb-6">
                            Meet <span className="text-blue-400">Slovi</span>
                        </h2>

                        <div className="space-y-6 text-xl md:text-2xl text-slate-600 font-medium font-jua leading-relaxed max-w-xl">
                            <p>
                                Slovi is our resident happiness officer. Born on the blockchain, this fluffy snow leopard
                                loves nothing more than seeing people spread kindness.
                            </p>
                            <p>
                                GiftChain is Slovi’s way of making crypto feel warm, personal, and human.
                                No cold transactions—just warm, wrapped surprises.
                            </p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button className="px-8 py-3 bg-blue-100/50 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition border-2 border-blue-200">
                                Follow on X
                            </button>
                            <button className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition border-2 border-slate-200">
                                Join Discord
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Mascot Image - Absolute on Desktop, Relative/Stacked on Mobile */}
                <motion.div
                    initial={{ y: 200, opacity: 0 }} // Start lower
                    whileInView={{ y: 0, opacity: 1 }} // Animate up
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="
                        relative w-full mt-12
                        lg:absolute lg:bottom-[-5%] lg:right-[-5%] lg:w-[60%] lg:mt-0 lg:h-auto
                        flex justify-center
                    "
                >
                    <motion.img
                        whileHover={{ scale: 1.02 }}
                        src={slovi}
                        alt="Slovi Mascot"
                        className="w-full max-w-lg lg:max-w-none drop-shadow-2xl relative z-10"
                    />
                    {/* Fade Blur at Bottom */}
                    <div className="absolute -bottom-3 left-0 w-full h-26 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
                </motion.div>

            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent hidden lg:block pointer-events-none" />
        </section>
    );
}

function FooterSection({ navigate }: { navigate: any }) {
    return (
        <footer className="bg-blue-900 text-white pt-24 pb-12 mt-[-50px] relative z-0">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                <div>
                    <h2 className="font-['Lilita_One'] text-5xl md:text-6xl mb-6">Ready to Send a Gift?</h2>
                    <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                        Connect your wallet, pick a cute wrapper, and make someone's day instantly.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/profile')}
                    className="px-10 py-5 bg-yellow-400 text-yellow-900 text-xl font-bold rounded-full shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:bg-yellow-300 hover:scale-105 transition-all"
                >
                    Start Gifting Now
                </button>

                <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-blue-300">
                    <p>© 2024 GiftChain. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Simple floating wrapper
function FloatingElement({ children, delay = 0, x = "0%", y = "0%" }: { children: React.ReactNode, delay?: number, x?: string, y?: string }) {
    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: -20 }}
            transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                delay: delay,
                ease: "easeInOut"
            }}
            style={{ left: x, top: y, position: 'absolute' }}
        >
            {children}
        </motion.div>
    );
}