import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Faq = () => {

    const faqs: { question: string, answer: string[] }[] = [
        {
            question: "What is GiftChain, really? I don't get it yet",
            answer: [
                "GiftChain lets you send crypto gifts directly to someone — instantly and on-chain — while preserving the moment of gifting.",
                "The funds go straight to the receiver.",
                "What remains on GiftChain is the wrapper, message, and proof of generosity."
            ]
        },
        {
            question: "So… does GiftChain hold my funds?",
            answer: [
                "No. Never.",
                "Funds move directly from sender to receiver on-chain.",
                "GiftChain does not lock, hold, or control your crypto at any point."
            ]
        },
        {
            question: "When does the receiver get the funds?",
            answer: [
                "Immediately.",
                "As soon as the transaction is confirmed on-chain, the receiver owns the funds — even before opening the gift wrapper."
            ]
        },
        {
            question: "Can I send a gift to someone who isn’t on GiftChain?",
            answer: [
                "Absolutely.",
                "You can send a gift to anyone as long as you have their wallet address.",
                "The funds go directly to their wallet on-chain — GiftChain simply keeps a record of your generosity and wraps it with your message."
            ]
        },
        {
            question: "Can I send gifts to creators or friends?",
            answer: [
                "Yes.",
                "GiftChain is built for supporting creators, friends, and communities — publicly or privately — without awkward wallet requests or DMs."
            ]
        },
        {
            question: "What happens when I open a gift?",
            answer: [
                "Opening a gift reveals:",
                "• The sender",
                "• Their message",
                "• The wrapper design",
                "The funds are already in your wallet — opening is about the experience, not claiming money.",
                "You also get your bragging rights — a public, on-chain proof of the love and support you received on GiftChain."
            ]
        },
        {
            question: "Is this safe? Can gifts be faked?",
            answer: [
                "Every gift is backed by a real on-chain transaction.",
                "GiftChain only records gifts that are verifiably sent on Solana or Sui."
            ]
        }
    ];


    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-white z-[2]" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-main uppercase text-5xl text-blue-900 mb-4">
                        Got Questions?
                    </h2>
                    <p className="text-xl text-slate-500 font-lexend">
                        We’ve got answers. No fine print, just facts.
                    </p>
                </div>

                <div className="space-y-4 mb-12">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQItem = ({ faq, isOpen, onClick }: { faq: { question: string, answer: string[] }, isOpen: boolean, onClick: () => void }) => {


    return (
        <motion.div
            initial={false}
            className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-400 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
            <button
                onClick={onClick}
                className="w-full px-8 py-6 flex items-center justify-between text-left gap-4"
            >
                <span className={`font-main text-xl md:text-2xl transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>
                    {faq.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ${isOpen ? 'text-blue-500' : 'text-slate-400'}`}
                >
                    <ChevronDown size={24} strokeWidth={3} />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-8 pb-8 pt-0">
                            <div className="w-full h-[2px] bg-blue-100/50 mb-4" />
                            <div className="space-y-3 text-slate-600 font-lexend text-lg leading-relaxed">
                                {faq.answer.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Faq;