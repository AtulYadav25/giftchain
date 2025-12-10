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
    Sparkles,
    Plus,
    Trash2,
    Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';
import { freeWrappers, premiumWrappers } from '@/assets/wrappers/wrapperIndex.ts';

// Mock Wrappers Data
const WRAPPERS = {
    free: freeWrappers,
    premium: premiumWrappers,
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

// Coin Assets (Mock)
const COIN_ASSETS = {
    SUI: { name: 'Sui', logo: 'https://cryptologos.cc/logos/sui-sui-logo.png?v=035' },
    SOL: { name: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=035' }
};

type Step = 1 | 2 | 3 | 4;

interface SendGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Recipient {
    id: string;
    address: string;
    amount: string;
}

export default function SendGiftModal({ isOpen, onClose }: SendGiftModalProps) {
    const [step, setStep] = useState<Step>(1);
    const [wrapperType, setWrapperType] = useState<'free' | 'premium'>('free');
    const [selectedWrapper, setSelectedWrapper] = useState<any>(null);

    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState<keyof typeof MESSAGE_TEMPLATES>('Love');

    const [currency, setCurrency] = useState<'SUI' | 'SOL'>('SUI');
    const [inputMode, setInputMode] = useState<'USD' | 'TOKEN'>('USD');
    const [isLoadingConversion, setIsLoadingConversion] = useState(false);

    // Recipient State
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: '1', address: '', amount: '' }
    ]);

    // Simulate loading when amount changes (in a real app this might be an API call)
    useEffect(() => {
        setIsLoadingConversion(true);

        const timer = setTimeout(() => setIsLoadingConversion(false), 800);
        return () => clearTimeout(timer);
    }, [
        recipients.length,                     // runs when a new recipient is added
        recipients.map(r => r.amount).join(), // runs only when amounts change
        currency,
        inputMode
    ]);


    // Constants
    const PLATFORM_FEE_BASE = 0.20;
    const PLATFORM_FEE_PERCENT = 0.01;

    // Actions
    const addRecipient = () => {
        setRecipients([...recipients, { id: Date.now().toString(), address: '', amount: '' }]);
    };

    const removeRecipient = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
        setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    // Billing Calculations
    const getRecipientValueInUSD = (amountStr: string) => {
        if (!amountStr) return 0;
        const val = parseFloat(amountStr);
        if (isNaN(val)) return 0;
        return inputMode === 'USD' ? val : val * EXCHANGE_RATES[currency];
    };

    const totalGiftValueUSD = recipients.reduce((acc, curr) => acc + getRecipientValueInUSD(curr.amount), 0);
    const wrapperPrice = selectedWrapper?.price || 0;
    // Fee is calculated on total volume
    const fee = (totalGiftValueUSD * PLATFORM_FEE_PERCENT) + PLATFORM_FEE_BASE;
    const total = totalGiftValueUSD + wrapperPrice + fee;

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
                        <h2 className="text-2xl font-lexend text-blue-900 flex items-center gap-2">
                            {step === 1 && <><Gift className="text-pink-500" /> Choose Wrapper</>}
                            {step === 2 && <><MessageCircle className="text-purple-500" /> Write Message</>}
                            {step === 3 && <><Coins className="text-yellow-500" /> Add Recipients</>}
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
                                <div className="font-lexend flex bg-blue-100/50 p-1 rounded-full w-fit mx-auto">
                                    <button
                                        onClick={() => setWrapperType('free')}
                                        className={`px-6 py-2 font-bold rounded-full text-sm  transition-all ${wrapperType === 'free' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-400 hover:text-blue-600'}`}
                                    >
                                        Free Wrappers
                                    </button>
                                    <button
                                        onClick={() => setWrapperType('premium')}
                                        className={`px-6 py-2 font-bold rounded-full text-sm transition-all ${wrapperType === 'premium' ? 'bg-white text-purple-600 shadow-sm' : 'text-blue-400 hover:text-purple-600'}`}
                                    >
                                        Premium
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {WRAPPERS[wrapperType].map((wrapper) => (
                                        <div
                                            key={wrapper.id}
                                            onClick={() => setSelectedWrapper(wrapper)}
                                            className={`relative aspect-square rounded-2xl cursor-pointer transition-all border-4 ${selectedWrapper?.id === wrapper.id
                                                ? 'border-blue-400 scale-95'
                                                : 'border-transparent hover:scale-105'
                                                }`}
                                        >
                                            {/* Wrapper Image */}
                                            <img
                                                src={wrapper.image}
                                                alt={wrapper.name || "Wrapper"}
                                                className="w-full h-full object-cover rounded-xl shadow-inner"
                                            />

                                            {/* Price Tag */}
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
                            <div className="space-y-6 font-lexend">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-2">Your Message (Max 2000 chars)</label>
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

                        {/* Step 3: Amount & Recipients */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Preview Small */}
                                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl mb-8">
                                    {/* Wrapper Image */}
                                    <img
                                        src={selectedWrapper?.image}
                                        alt="Selected wrapper"
                                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />

                                    {/* Message */}
                                    <p className="text-sm text-slate-600 line-clamp-2 flex-1 italic font-lexend">
                                        "{message || "No message"}"
                                    </p>
                                </div>


                                <div className="space-y-6 font-lexend">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-500">Recipients</label>
                                        <button
                                            onClick={() => setInputMode(m => m === 'USD' ? 'TOKEN' : 'USD')}
                                            className="text-xs font-bold text-blue-500 hover:underline"
                                        >
                                            Switch Input to {inputMode === 'USD' ? currency : 'USD'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {recipients.map((recipient, index) => (
                                            <motion.div
                                                key={recipient.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm relative group"
                                            >
                                                {recipients.length > 1 && (
                                                    <button
                                                        onClick={() => removeRecipient(recipient.id)}
                                                        className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-200"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}

                                                <div className="grid gap-4">
                                                    {/* Amount Row */}
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-400 ml-1 mb-1 block font-lexend">Amount ({inputMode})</label>
                                                            <div className="relative flex items-center">
                                                                <InputGroup>
                                                                    <InputGroupInput
                                                                        type="number"
                                                                        value={recipient.amount}
                                                                        onChange={(e) => updateRecipient(recipient.id, "amount", e.target.value)}
                                                                        placeholder="0.00"
                                                                        className="h-12 text-lg font-lexend pr-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                    />
                                                                    <InputGroupAddon>
                                                                        <InputGroupText>{inputMode === 'USD' ? '$' : currency}</InputGroupText>
                                                                    </InputGroupAddon>
                                                                    <InputGroupAddon align="inline-end" className="min-w-[80px] justify-end">
                                                                        <InputGroupText className="text-muted-foreground text-xs font-medium">
                                                                            {isLoadingConversion ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                            ) : (
                                                                                <>≈ {(() => {
                                                                                    const val = parseFloat(recipient.amount);
                                                                                    if (isNaN(val) || val === 0) return '0.00';
                                                                                    const rate = EXCHANGE_RATES[currency];
                                                                                    if (inputMode === 'USD') {
                                                                                        return `${(val / rate).toFixed(4)} ${currency}`;
                                                                                    }
                                                                                    return `$${(val * rate).toFixed(2)}`;
                                                                                })()}</>
                                                                            )}
                                                                        </InputGroupText>
                                                                    </InputGroupAddon>
                                                                </InputGroup>

                                                            </div>
                                                        </div>

                                                        {/* Currency Dropdown Component - Repeated for consistent UI structure, but synced globally */}
                                                        <div className="w-[140px]">
                                                            <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Currency</label>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger className="w-full flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 h-12 px-3 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-blue-100">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={COIN_ASSETS[currency].logo} />
                                                                        <AvatarFallback>{currency[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-bold text-sm text-slate-700 flex-1 text-left">{currency}</span>
                                                                    <ChevronRight className="rotate-90 text-slate-400" size={14} />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {(['SUI', 'SOL'] as const).map((c) => (
                                                                        <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="gap-2 p-2 cursor-pointer">
                                                                            <Avatar className="h-5 w-5">
                                                                                <AvatarImage src={COIN_ASSETS[c].logo} />
                                                                                <AvatarFallback>{c[0]}</AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="font-bold">{c}</span>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {/* Wallet Address Row */}
                                                    <div>
                                                        <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block">Receiver Wallet Address</label>
                                                        <Input
                                                            value={recipient.address}
                                                            onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                                                            placeholder={`Enter ${currency} address`}
                                                            className="h-11 font-mono text-sm bg-slate-50/50"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={addRecipient}
                                        className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-400 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} /> Add Recipient
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Billing */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="bg-white font-lexend border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-700 mb-4">Gift Details</h3>

                                    {/* Recipient List */}
                                    <div className="space-y-2 mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipients ({recipients.length})</label>
                                        <div className="bg-slate-50/80 rounded-xl p-4 max-h-40 overflow-y-auto space-y-2">
                                            {recipients.map((r, i) => {
                                                const val = parseFloat(r.amount) || 0;
                                                const displayAmount = inputMode === 'USD' ? `$${val}` : `${val} ${currency}`;
                                                return (
                                                    <div key={r.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 font-mono truncate max-w-[200px]" title={r.address}>
                                                            #{i + 1} {r.address || 'Missing Address'}
                                                        </span>
                                                        <span className="font-bold text-slate-700">{displayAmount}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal Gift Amount</span>
                                        <span className="font-medium">
                                            $
                                            {Number(totalGiftValueUSD).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-slate-600">
                                        <span>Wrapper ({selectedWrapper?.name})</span>
                                        <span className="font-medium">{selectedWrapper?.price === 0 ? 'FREE' : `$${selectedWrapper?.price}`}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Platform Fee <span className="text-xs text-slate-400">(1% + $0.20)</span></span>
                                        <span className="font-medium">${fee.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}</span>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-4 mt-4 flex justify-between items-center">
                                        <span className="font-bold text-slate-800 text-lg">Total</span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">${total.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}</div>
                                            <div className="text-xs text-slate-400">
                                                ≈ {inputMode === 'USD'
                                                    ? `${(total / EXCHANGE_RATES[currency]).toFixed(4)} ${currency}`
                                                    : `${((total / EXCHANGE_RATES[currency]) * 1).toFixed(4)} ${currency}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 flex items-start gap-3">
                                    <Sparkles className="shrink-0 mt-0.5" size={16} />
                                    <p>Your gifts will be wrapped instantly and sent to all recipients once confirmed!</p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Navigation */}
                    <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-xl font-lexend text-slate-500 hover:bg-slate-100 font-bold flex items-center gap-2 transition-colors"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        ) : <div />}

                        <button
                            onClick={step === 4 ? onClose : handleNext}
                            disabled={step === 1 && !selectedWrapper}
                            className={`px-8 py-3 rounded-xl font-bold font-lexend text-white flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 ${step === 4 ? 'bg-slate-900 hover:bg-slate-800 w-full md:w-auto justify-center' : 'bg-blue-500 hover:bg-blue-600'
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
