import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion';
import HomeBg from '@/assets/hero/bg.webp';
import mascot from '@/assets/hero/mascot_hero.webp'
import giftFactory from '@/assets/how_it_works/gift_factory.webp'
import CircularGallery from '@/components/CircularGallery'

import slovi from '@/assets/hero/slovi.png'
import { allWrappers } from '@/assets/wrappers/wrapperIndex';

const Home = () => {
    const [scrollY, setScrollY] = useState(0);
    const homeSectionRef = useRef<HTMLDivElement>(null);


    const { scrollYProgress } = useScroll();
    const imageScale = useTransform(scrollYProgress, [0.2, 0.8], [1, 1.2]);




    useEffect(() => {
        const handleScroll = () => {
            if (homeSectionRef.current) {
                const rect = homeSectionRef.current.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionBottom = sectionTop + rect.height;
                const currentScroll = window.scrollY;

                // Only update scrollY if we're within the home section bounds
                if (currentScroll >= sectionTop && currentScroll <= sectionBottom) {
                    setScrollY(currentScroll - sectionTop);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const blurAmount = Math.min(scrollY / 30, 10);
    const translateY = -scrollY * 0.5;

    const allWrappersImg = allWrappers.map((wrapper) => ({
        text: wrapper.name,
        image: wrapper.image
    }));


    return (
        <div className='bg-secondary-clr' >
            <div className="relative w-full min-h-screen " ref={homeSectionRef}>
                {/* Full-screen background */}
                <img src={HomeBg} className='w-full h-full absolute object-cover' />

                {/* Content container */}
                <div className="relative w-full h-screen flex flex-col items-center justify-center">
                    {/* Heading */}
                    <h1 style={{
                        transform: `translateY(-${translateY}px)`,
                        filter: `blur(${blurAmount}px)`,
                        transition: 'filter 0.1s ease-out'
                    }}
                        className="font-gluten font-bold text-white text-6xl text-center mb-12 uppercase">
                        SENDING CRYPTO GIFTS <br /> MADE EASY
                    </h1>

                    {/* Animated Mascot */}
                    <div
                        className='w-full flex justify-center h-[200px] items-center '
                        style={{
                            transform: `translateY(${translateY}px)`,
                            filter: `blur(${blurAmount}px)`,
                            transition: 'filter 0.1s ease-out'
                        }}
                    >
                        <img
                            src={mascot}
                            alt="mascot"
                            className="w-[75%] md:w-[35%] transform translate-y-[60%] absolute bottom-0 mb-10"
                        />
                    </div>
                </div>
            </div>
            <section className="py-20 max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-white mb-16 font-gluten">How it Works?</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-min">
                    {/* First Column, Row 1: Scaling Image */}
                    <div className="order-1 lg:col-start-1 lg:row-start-1 h-[300px] lg:h-[400px] rounded-3xl overflow-hidden border-2 border-white shadow-xl">
                        <motion.div
                            style={{ scale: imageScale }}
                            className="w-full h-full"
                        >
                            <img
                                src={giftFactory}
                                alt="How it works step 1"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Second Column: 4 Info Boxes */}
                    <div className="font-gluten order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex flex-col gap-6">

                        <div className=" border-2 border-white rounded-md p-6 bg-blue-600/20 backdrop-blur-md">
                            <h3 className="text-2xl text-white mb-1 uppercase font-medium">1. Pick a Gift Wrapper</h3>
                            <p className="text-gray-50 font-300 text-lg">
                                We offer a bunch of cute, cozy, emotional wrappers — soft colors, playful vibes, warm personalities.<br />

                                This wrapper becomes the little “first impression” they see… so make it special. You can customize your wrappers too!
                            </p>
                        </div>
                        <div className=" border-2 border-white rounded-md p-6 bg-blue-600/20 backdrop-blur-md">
                            <h3 className="text-2xl text-white mb-1 uppercase font-medium">2. Write a Message (Highly Recommended!)</h3>
                            <p className="text-gray-50 font-300 text-lg">
                                You can write something sweet, funny, comforting — anything from a tiny note to a long, heartfelt message.<br />

                                TBH… pairing a message with a gift almost always melts the heart of the person receiving it.<br />
                                We strongly recommend adding one — but it’s your call.
                            </p>
                        </div>
                        <div className=" border-2 border-white rounded-md p-6 bg-blue-600/20 backdrop-blur-md">
                            <h3 className="text-2xl text-white mb-1 uppercase font-medium">3. Add the Gift You Want to Send</h3>
                            <p className="text-gray-50 font-300 text-lg">
                                Not “payment.” Not “transfer.”<br />
                                Just a token of love — something meaningful from you to them.<br />

                                You can send: <span className='font-bold '>
                                    $SUI (Sui) &
                                    $SOL (Solana)</span><br />
                                It’s the emotion that counts, not the amount.
                            </p>
                        </div>
                        <div className=" border-2 border-white rounded-md p-6 bg-blue-600/20 backdrop-blur-md">
                            <h3 className="text-2xl text-white mb-1 uppercase">4. We Deliver It With Care</h3>
                            <p className="text-gray-50 font-300 text-lg">
                                When they come to GiftChain and connect, they’ll see a cute unopened gift box waiting.<br />
                                They tap to open it, see your message, and feel the love.
                            </p>
                        </div>

                    </div>

                    {/* First Column, Row 2: Static Image */}
                    <div className="order-3 lg:col-start-1 lg:row-start-2 h-[300px] lg:h-[400px] rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl">
                        <img
                            src="https://placehold.co/600x400/png?text=Static+Image"
                            alt="How it works step 2"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>
            <section className="py-20 max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-white mb-16 font-gluten">Gift Wrappers</h2>
                <div style={{ height: '600px', position: 'relative' }}>
                    <CircularGallery
                        bend={0}
                        items={allWrappersImg}
                        textColor="#ffffff"
                        borderRadius={0.05}
                        scrollEase={0.02} />
                </div>
            </section>
            <section className="relative py-20 max-w-7xl mx-auto px-4 overflow-hidden">

                {/* Background Clouds */}
                {/* <img
                    src="https://placehold.co/1600x900/png"
                    alt="clouds"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                /> */}

                {/* Mascot Bottom Right */}
                <img
                    src={slovi}
                    alt="slovi mascot"
                    className="absolute right-0 bottom-0 w-[60%] md:w-[50%] pointer-events-none"
                />

                {/* Content */}
                <div className="relative max-w-3xl z-10">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-gluten">
                        ABOUT SLOVI
                    </h2>

                    <p className="text-lg md:text-xl text-white/90 leading-relaxed font-gluten">
                        Slovi is a snow leopard born on the Sui Network — cute, curious,
                        and quietly cheering for every builder across every blockchain.
                        Slovi believes the future belongs to those who create, experiment,
                        and spread kindness in the ecosystem.
                        <br /><br />
                        Some say Slovi might even become the next viral meme coin… who knows?
                        But one thing is certain — if you stay close to Slovi, fun things tend
                        to happen.
                        <br /><br />
                        And today, Slovi is offering <span className="font-semibold text-blue-100">
                            GiftChain.fun</span> — a warm, emotional way to send crypto gifts that
                        actually feel human. Send love, send messages, send memories… Slovi
                        delivers them with care.
                    </p>
                </div>

            </section>
            <section className="relative py-28 px-4 flex flex-col items-center text-center">
                <h2 className="text-4xl md:text-5xl font-gluten font-bold text-white mb-6 leading-snug">
                    Make someone smile today<br />
                    Send your first gift
                </h2>

                <button className="mt-4 px-8 py-3 bg-white/20 text-white rounded-xl backdrop-blur-md 
                     hover:bg-white/30 transition font-semibold text-lg">
                    Start Gifting
                </button>
            </section>



            <footer className="py-10 mt-5 text-center text-white/80 border-t-3">
                <div className="flex flex-col items-center gap-3">

                    {/* Follow button */}
                    <button className="mt-4 px-6 py-2 bg-white/20 rounded-lg backdrop-blur-md 
                       hover:bg-white/30 transition text-sm font-semibold">
                        Follow SLOVI on X
                    </button>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-lg">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                    </div>


                    {/* Footer Credit */}
                    <p className="text-md mt-2 opacity-70">© {new Date().getFullYear()} GiftChain By SLOVI</p>
                </div>
            </footer>


        </div>
    )
}

export default Home