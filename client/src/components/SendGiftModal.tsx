import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Gift,
    MessageCircle,
    Coins,
    Check,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Sparkles
} from 'lucide-react';

// Mock Wrappers Data
const WRAPPERS = {
    free: [
        { id: 'f1', name: 'Blue Sky', image: 'bg-blue-200', price: 0 },
        { id: 'f2', name: 'Pink Love', image: 'bg-pink-200', price: 0 },
        { id: 'f3', name: 'Sunny Day', image: 'bg-yellow-200', price: 0 },
        { id: 'f4', name: 'Minty Fresh', image: 'bg-green-200', price: 0 },
        { id: 'f5', name: 'Lavender', image: 'bg-purple-200', price: 0 },
        { id: 'f6', name: 'Peach', image: 'bg-orange-200', price: 0 },
    ],
    premium: [
        { id: 'p1', name: 'Galaxy', image: 'bg-gradient-to-r from-purple-500 to-indigo-500', price: 0.99 },
        { id: 'p2', name: 'Gold Dust', image: 'bg-gradient-to-r from-yellow-400 to-yellow-600', price: 1.49 },
        { id: 'p3', name: 'Holo', image: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400', price: 2.99 },
        { id: 'p4', name: 'Neon Nights', image: 'bg-gradient-to-r from-blue-600 to-purple-600', price: 1.99 },
        { id: 'p5', name: 'Rose Gold', image: 'bg-gradient-to-r from-rose-300 to-rose-500', price: 1.99 },
        { id: 'p6', name: 'Midnight', image: 'bg-slate-800', price: 0.50 },
    ]
};

// Mock Templates
const MESSAGE_TEMPLATES = {
    Love: [
        "Sending you a little something to brighten your day! 💖",
        "Love you to the moon and back! 🌙✨",
        "Just because... you're amazing! ❤️"
    ],
    Friend: [
        "High five! You deserve this. 🙌",
        "Treat yourself to something nice! ☕",
        "For my favorite crypto pal! 🚀"
    ],
    Giveaway: [
        "Congratulations! You won! 🎉",
        "Enjoy your rewards! 🏆",
        "Thanks for being part of the community! 🌟"
    ]
};

// Exchange Rates (Mock)
const EXCHANGE_RATES = {
    SUI: 1.5, // 1 SUI = $1.50
    SOL: 145.0 // 1 SOL = $145.00
};

type Step = 1 | 2 | 3 | 4;

interface SendGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SendGiftModal({ isOpen, onClose }: SendGiftModalProps) {
    const [step, setStep] = useState<Step>(1);
    const [wrapperType, setWrapperType] = useState<'free' | 'premium'>('free');
    const [selectedWrapper, setSelectedWrapper] = useState<any>(null);

    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState<keyof typeof MESSAGE_TEMPLATES>('Love');

    const [currency, setCurrency] = useState<'SUI' | 'SOL'>('SUI');
    const [inputMode, setInputMode] = useState<'USD' | 'TOKEN'>('USD');
    const [amount, setAmount] = useState('');
    const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
    const [isLoadingConversion, setIsLoadingConversion] = useState(false);

    // Constants
    const PLATFORM_FEE_BASE = 0.20;
    const PLATFORM_FEE_PERCENT = 0.01;

    // Conversion Logic
    useEffect(() => {
        if (!amount) {
            setConvertedAmount(null);
            return;
        }

        const timer = setTimeout(() => {
            setIsLoadingConversion(true);
            setTimeout(() => {
                const val = parseFloat(amount);
                if (isNaN(val)) {
                    setConvertedAmount(null);
                } else {
                    const rate = EXCHANGE_RATES[currency];
                    if (inputMode === 'USD') {
                        // Convert USD to Token
                        setConvertedAmount((val / rate).toFixed(4));
                    } else {
                        // Convert Token to USD
                        setConvertedAmount((val * rate).toFixed(2));
                    }
                }
                setIsLoadingConversion(false);
            }, 800); // Simulate API delay
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [amount, currency, inputMode]);

    // Billing Calculations
    const getGiftValueInUSD = () => {
        if (!amount) return 0;
        const val = parseFloat(amount);
        return inputMode === 'USD' ? val : val * EXCHANGE_RATES[currency];
    };

    const giftValueUSD = getGiftValueInUSD();
    const wrapperPrice = selectedWrapper?.price || 0;
    const fee = (giftValueUSD * PLATFORM_FEE_PERCENT) + PLATFORM_FEE_BASE;
    const total = giftValueUSD + wrapperPrice + fee;

    const handleNext = () => setStep(s => Math.min(4, s + 1) as Step);
    const handleBack = () => setStep(s => Math.max(1, s - 1) as Step);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
                        <h2 className="text-2xl font-['Lilita_One'] text-blue-900 flex items-center gap-2">
                            {step === 1 && <><Gift className="text-pink-500" /> Choose Wrapper</>}
                            {step === 2 && <><MessageCircle className="text-purple-500" /> Write Message</>}
                            {step === 3 && <><Coins className="text-yellow-500" /> Add Amount</>}
                            {step === 4 && <><Check className="text-green-500" /> Confirm & Send</>}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-400">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 relative">

                        {/* Step 1: Wrapper Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="flex bg-blue-100/50 p-1 rounded-full w-fit mx-auto">
                                    <button
                                        onClick={() => setWrapperType('free')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${wrapperType === 'free' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-600'}`}
                                    >
                                        Free Wrappers
                                    </button>
                                    <button
                                        onClick={() => setWrapperType('premium')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${wrapperType === 'premium' ? 'bg-white text-purple-600 shadow-sm' : 'text-blue-400 hover:text-purple-600'}`}
                                    >
                                        Premium
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {WRAPPERS[wrapperType].map((wrapper) => (
                                        <div
                                            key={wrapper.id}
                                            onClick={() => setSelectedWrapper(wrapper)}
                                            className={`relative aspect-square rounded-2xl cursor-pointer transition-all border-4 ${selectedWrapper?.id === wrapper.id ? 'border-blue-400 scale-95' : 'border-transparent hover:scale-105'}`}
                                        >
                                            <div className={`w-full h-full rounded-xl ${wrapper.image} shadow-inner bg-cover bg-center`} />
                                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                                {wrapper.price === 0 ? 'FREE' : `$${wrapper.price}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Message */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Your Message (Max 2000 chars)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={2000}
                                        placeholder="Write something sweet..."
                                        className="w-full h-32 p-4 rounded-2xl bg-blue-50/50 border-2 border-blue-100 focus:border-blue-300 focus:ring-0 resize-none transition-all placeholder:text-blue-200"
                                    />
                                    <div className="text-right text-xs text-slate-400 mt-1">{message.length}/2000</div>
                                </div>

                                <div>
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                        {Object.keys(MESSAGE_TEMPLATES).map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(tag as any)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedTag === tag ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid gap-3">
                                        {MESSAGE_TEMPLATES[selectedTag].map((msg, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setMessage(msg)}
                                                className="text-left p-3 rounded-xl bg-white border border-slate-100 text-slate-600 text-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-[0.99]"
                                            >
                                                {msg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amount */}
                        {step === 3 && (
                            <div className="space-y-8">
                                {/* Preview Small */}
                                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl">
                                    <div className={`w-12 h-12 rounded-lg ${selectedWrapper?.image} shadow-sm`} />
                                    <p className="text-sm text-slate-600 line-clamp-2 flex-1 italic">"{message || "No message"}"</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-500">Amount to Send</label>
                                        <button
                                            onClick={() => setInputMode(m => m === 'USD' ? 'TOKEN' : 'USD')}
                                            className="text-xs font-bold text-blue-500 hover:underline"
                                        >
                                            Switch to {inputMode === 'USD' ? currency : 'USD'}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full text-5xl font-['Lilita_One'] text-center bg-transparent border-none focus:ring-0 placeholder:text-slate-200 text-slate-700 py-4"
                                            autoFocus
                                        />
                                        <div className="text-center text-slate-400 font-bold mb-2">
                                            {inputMode === 'USD' ? '$' : currency}
                                        </div>
                                    </div>

                                    {/* Conversion Display */}
                                    <div className="h-8 flex items-center justify-center">
                                        {isLoadingConversion ? (
                                            <div className="flex items-center gap-2 text-blue-400 text-sm">
                                                <Loader2 size={16} className="animate-spin" /> Calculating...
                                            </div>
                                        ) : convertedAmount ? (
                                            <div className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">
                                                ≈ {inputMode === 'USD' ? `${convertedAmount} ${currency}` : `$${convertedAmount}`}
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Currency Toggle */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        {['SUI', 'SOL'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setCurrency(c as any)}
                                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${currency === c ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${c === 'SUI' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                                <span className="font-bold">{c}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Billing */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-700 mb-4">Bill Details</h3>

                                    <div className="flex justify-between text-slate-600">
                                        <span>Gift Amount</span>
                                        <span className="font-medium">${giftValueUSD.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Wrapper ({selectedWrapper?.name})</span>
                                        <span className="font-medium">{selectedWrapper?.price === 0 ? 'FREE' : `$${selectedWrapper?.price}`}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Platform Fee <span className="text-xs text-slate-400">(1% + $0.20)</span></span>
                                        <span className="font-medium">${fee.toFixed(2)}</span>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-4 mt-4 flex justify-between items-center">
                                        <span className="font-bold text-slate-800 text-lg">Total</span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</div>
                                            <div className="text-xs text-slate-400">
                                                ≈ {inputMode === 'USD'
                                                    ? `${(total / EXCHANGE_RATES[currency]).toFixed(4)} ${currency}`
                                                    : `${((total / EXCHANGE_RATES[currency]) * 1).toFixed(4)} ${currency}` /* Simplified logic for demo */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 flex items-start gap-3">
                                    <Sparkles className="shrink-0 mt-0.5" size={16} />
                                    <p>Your gift will be wrapped instantly and the recipient can open it as soon as the transaction confirms!</p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Navigation */}
                    <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-bold flex items-center gap-2 transition-colors"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        ) : <div />}

                        <button
                            onClick={step === 4 ? onClose : handleNext}
                            disabled={step === 1 && !selectedWrapper}
                            className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 ${step === 4 ? 'bg-slate-900 hover:bg-slate-800 w-full md:w-auto justify-center' : 'bg-blue-500 hover:bg-blue-600'
                                } ${(!selectedWrapper && step === 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {step === 4 ? 'Confirm Payment' : 'Next Step'} <ChevronRight size={18} />
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
