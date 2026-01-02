import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import mascot from '@/assets/hero/mascot_hero.webp';
import slovi from '@/assets/hero/slovi.png';
import { ArrowRight, Gift, Sparkles, Smartphone, Link as LinkIcon, Edit, Wallet, PenLine, Send } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import TotalFundsCounter from '@/components/TotalFundsCounter';
import Faq from '@/components/Faq';
import { allWrappers } from '@/assets/wrappers/wrapperIndex';
import toast from 'react-hot-toast';

//How it works images
import howItWorks1 from '@/assets/how_it_works/howItWorks1.png';
import howItWorks2 from '@/assets/how_it_works/howItWorks2.png';
import howItWorks3 from '@/assets/how_it_works/howItWorks3.png';
import howItWorks4 from '@/assets/how_it_works/howItWorks4.png';
import { useUser } from '@/store';

// Prepare Wrapper Images for Gallery
const galleryItems = allWrappers.map(w => ({ text: w.name, image: w.wrapperImg }));

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const user = useUser();

    return (
        <div ref={containerRef} className="w-full min-h-screen bg-[#E3F4FF] overflow-x-hidden">
            {/* 1. HERO SECTION */}
            <HeroSection navigate={navigate} address={user?.address} />

            {/* 2. TICKER MARQUEE */}
            <MarqueeSection />

            {/* 2.5 CUSTODY DISCLAIMER (Playful) */}
            <CustodySection />

            {/* NEW: VISUAL FUNDS COUNTER */}
            <TotalFundsCounter />

            {/* 3. HOW IT WORKS (Scroll Reveal) */}
            <HowItWorksSection />

            {/* 4. WRAPPER SHOWCASE */}
            <WrapperShowcaseSection />

            {/* 5. ABOUT / MASCOT */}
            <AboutSection />

            {/* 6. FAQ */}
            <Faq />

            {/* 7. CALL TO ACTION / FOOTER */}
            <FooterSection navigate={navigate} address={user?.address} />
        </div>
    );
}

// --- SUB-COMPONENTS ---

function HeroSection({ navigate, address }: { navigate: any, address: string | undefined }) {
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
                    className="text-xl md:text-2xl text-blue-50 font-jua max-w-3xl mx-auto leading-relaxed"
                >
                    Send $SOL & $SUI Tokens wrapped in beautiful, animated digital gifts.
                    Add a message, choose a vibe, and make someone’s day.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="z-12 flex flex-col md:flex-row gap-4 justify-center items-center pt-4"
                >
                    <button
                        onClick={() => {
                            if (!address) return toast("Please Connect Your Wallet");
                            navigate('/profile')
                        }}
                        className="px-8 py-4 cursor-pointer z-[20] bg-white text-blue-600 rounded-full  font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group"
                    >
                        Send a Gift Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={() => navigate('/hall-of-givers')} className="px-8 py-4 bg-blue-700/30 text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md z-[12]">
                        Hall of Givers
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

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#E3F4FF] via-[#E3F4FF]/50 to-transparent z-[2]" />
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
                    <span key={i} className="text-white font-black italic tracking-widest text-2xl mx-4">
                        WE ALL USE GIFTCHAIN
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function HowItWorksSection() {
    const steps = [
        {
            icon: <Wallet size={32} className="text-white" />,
            title: "Connect Wallet",
            desc: "Link your SUI wallet securely in one click. No sign-ups, no hassle.",
            color: "bg-blue-400",
            rotate: "-rotate-2"
        },
        {
            icon: <Gift size={32} className="text-white" />,
            title: "Choose Wrapper",
            desc: "Select from our adorable collection of wrappers to wrap your crypto gift.",
            color: "bg-pink-400",
            rotate: "rotate-1"
        },
        {
            icon: <PenLine size={32} className="text-white" />,
            title: "Write Message",
            desc: "Add a heartfelt or fun message. TBH! messages are the best part.",
            color: "bg-purple-400",
            rotate: "-rotate-1"
        },
        {
            icon: <Send size={32} className="text-white" />,
            title: "Send Instantly",
            desc: "Load your gift with tokens and send it instantly to anyone.",
            color: "bg-green-400",
            rotate: "rotate-2"
        }
    ];

    return (
        <section className="py-32 px-4 bg-slate-900 border-y-8 border-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-24 space-y-4 relative z-20">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-block bg-yellow-300 border-[3px] border-slate-900 shadow-[4px_4px_0_0_white] px-6 py-2 rounded-full font-black text-slate-900 mb-6 transform -rotate-2"
                    >
                        SIMPLE AS 1, 2, 3... 4!
                    </motion.div>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="font-['Lilita_One'] text-6xl md:text-7xl text-white drop-shadow-[4px_4px_0_#2563eb]"
                    >
                        HOW IT WORKS
                    </motion.h2>
                </div>

                {/* Steps Container */}
                <div className="relative">

                    {/* SVG Connector Line - Absolute & Behind */}
                    <div className="absolute top-0 bottom-0 left-0 right-0 hidden md:block z-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 400" preserveAspectRatio="none">
                            <path
                                d="M 25 50 C 25 100, 75 100, 75 150 C 75 200, 25 200, 25 250 C 25 300, 75 300, 75 350"
                                fill="none"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    <div className="space-y-12 md:space-y-0">
                        {steps.map((step, i) => {
                            const isEven = i % 2 === 0;
                            return (
                                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10 md:h-[400px] ${!isEven ? 'md:flex-row-reverse' : ''}`}>

                                    {/* STEP CARD (Alternates L/R) */}
                                    <div className="w-full md:w-1/2 flex justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                                            whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
                                            className={`relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 border-[4px] border-slate-900 shadow-[8px_8px_0_0_rgba(255,255,255,1)] flex flex-col items-center text-center group ${step.rotate}`}
                                        >
                                            <div className="absolute -top-6 bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-[3px] border-white shadow-md z-20">
                                                {i + 1}
                                            </div>

                                            <div className={`w-24 h-24 rounded-full ${step.color} border-[3px] border-slate-900 flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)] group-hover:scale-110 transition-transform duration-300`}>
                                                {step.icon}
                                            </div>

                                            <h3 className="font-['Lilita_One'] text-3xl text-slate-900 mb-4 uppercase tracking-wide">
                                                {step.title}
                                            </h3>

                                            <p className="text-slate-500 font-medium font-jua text-lg leading-relaxed">
                                                {step.desc}
                                            </p>

                                            <div className="absolute top-4 right-4 text-slate-200 opacity-50 pointer-events-none transform rotate-12">
                                                <Sparkles size={24} />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* IMAGE (Alternates R/L) */}
                                    {/* IMAGE (Alternates R/L) */}
                                    <div className="w-full md:w-1/2 flex justify-center px-8">
                                        <motion.div
                                            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                            className="w-full flex items-center justify-center relative"
                                        >
                                            <img
                                                src={[howItWorks1, howItWorks2, howItWorks3, howItWorks4][i]}
                                                alt={`Step ${i + 1}`}
                                                className="w-full h-auto max-h-[320px] object-contain"
                                            />
                                        </motion.div>
                                    </div>



                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-32 relative z-20"
                >
                    <p className="text-blue-200/80 font-mono text-sm tracking-widest uppercase">Start gifting in seconds • Send smiles, not steps — gifting made easy</p>
                </motion.div>
            </div>
        </section>
    );
}

function WrapperShowcaseSection() {
    return (
        <section className="py-20 relative bg-slate-900 overflow-hidden mt-[-15px]">
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

function CustodySection() {
    return (
        <section className="py-24 bg-[#FF6EC7] relative overflow-hidden -skew-y-2 mt-24 mb-12 border-y-8 border-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent" />
            </div>

            <div className="skew-y-2 max-w-5xl mx-auto px-6 text-center relative z-10">

                {/* Floating Words Background - Weird Spacing */}
                <div className="absolute inset-0 pointer-events-none select-none opacity-20 font-black text-9xl overflow-hidden flex flex-col justify-between" style={{ zIndex: -1 }}>
                    <motion.div animate={{ x: [0, 100, 0] }} transition={{ duration: 10, repeat: Infinity }} className="text-white whitespace-nowrap">NO CAGE</motion.div>
                    <motion.div animate={{ x: [0, -100, 0] }} transition={{ duration: 15, repeat: Infinity }} className="text-blue-900 whitespace-nowrap self-end">JUST WRAP</motion.div>
                    <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity }} className="text-yellow-300 whitespace-nowrap text-center">YOUR KEYS</motion.div>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <h2 className="font-['Lilita_One'] text-7xl md:text-8xl text-white drop-shadow-[0_5px_0px_rgba(0,0,0,0.2)] tracking-tighter transform -rotate-2">
                        NO CUSTODY.
                        <br />
                        <span className="text-yellow-300 inline-block animate-pulse">MAXIMUM CHILL.</span>
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-jua text-2xl md:text-3xl text-blue-900 mt-8 max-w-3xl mx-auto leading-relaxed bg-white/30 backdrop-blur-sm p-6 rounded-[2rem] border-4 border-white/50 shadow-lg transform rotate-1"
                >
                    We never <span className="underline decoration-wavy decoration-pink-500">hold</span>, <span className="underline decoration-wavy decoration-purple-500">lock</span>, or <span className="underline decoration-wavy decoration-blue-500">touch</span> your funds.
                    <br />
                    We just wrap them in glitter. You stay in control.
                </motion.p>

                <div className="mt-10 flex justify-center gap-4 flex-wrap">
                    {["Not A Bank", "Self-Custodial", "100% Yours", "No Lockups"].map((tag, i) => (
                        <motion.span
                            key={i}
                            whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
                            className="inline-block px-6 py-3 bg-white text-pink-600 font-bold font-jua rounded-full border-2 border-pink-400 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] text-xl cursor-default"
                        >
                            {tag}
                        </motion.span>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FooterSection({ navigate, address }: { navigate: any, address: string | undefined }) {
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
                    onClick={() => {
                        if (!address) return toast("Please Connect Your Wallet");
                        navigate('/profile')
                    }}
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