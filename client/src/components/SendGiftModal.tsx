import React, { useState, useEffect, useMemo } from 'react';
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
import { useWrapperActions, useWrappers, useWrapperLoading } from '@/store/useWrapperStore';
import { useGiftActions } from '@/store';
import useGiftStore, { type SendGiftParams } from '@/store/useGiftStore';
import { isValidSuiAddress } from '@mysten/sui/utils';
import toast from 'react-hot-toast';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';




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



// Coin Assets (Mock)
const COIN_ASSETS = {
    SUI: { name: 'Sui', logo: 'https://cryptologos.cc/logos/sui-sui-logo.png?v=035' }
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

    // Wrapper Store Integration
    const { fetchWrappers, uploadWrapper, deleteWrapper } = useWrapperActions();
    const wrappers = useWrappers();
    const isWrapperLoading = useWrapperLoading();

    useEffect(() => {
        fetchWrappers();
    }, []);

    const filteredWrappers = useMemo(() => {
        return wrappers.filter(w =>
            wrapperType === 'free' ? w.priceUSD === 0 : w.priceUSD > 0
        );
    }, [wrappers, wrapperType]);

    // Handle File Upload
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await uploadWrapper(file);
                toast.success('Wrapper uploaded successfully!');
            } catch (error) {
                toast.error('Failed to upload wrapper');
            }
        }
    };

    const [message, setMessage] = useState('');
    const [selectedTag, setSelectedTag] = useState<keyof typeof MESSAGE_TEMPLATES>('Love');

    const [currency, setCurrency] = useState<'SUI' | 'SOL'>('SUI');
    const [inputMode, setInputMode] = useState<'USD' | 'TOKEN'>('USD');
    const [isLoadingConversion, setIsLoadingConversion] = useState(false);

    //Sender Account
    const account = useCurrentAccount();

    //Gift Store Actions
    const { sendGift, verifyGift } = useGiftActions();

    // SUI Price
    const { getSUIPrice } = useGiftActions();
    const { suiStats } = useGiftStore((s) => s);

    //EXCHANGE RATES
    // Exchange Rates (Mock)
    // const EXCHANGE_RATES = {
    //     SUI: 1.5, // 1 SUI = $1.50
    //     SOL: 145.0 // 1 SOL = $145.00
    // };
    const exchangeRates = useMemo(() => ({
        SUI: suiStats.suiPrice
    }), [suiStats]);

    // Recipient State
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: '1', address: '', amount: '' }
    ]);

    // Simulate loading when amount changes (in a real app this might be an API call)
    useEffect(() => {
        setIsLoadingConversion(true);
        const fetchSUIPrice = async () => {
            await getSUIPrice();
            setIsLoadingConversion(false);
        };
        fetchSUIPrice();
    }, []);


    // Constants
    const PLATFORM_FEE_BASE = 0.00;
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
        return inputMode === 'USD' ? val : val * exchangeRates.SUI!;
    };

    //Function to convert usd to sui
    const getUSDToSUI = (amountStr: string) => {
        if (!amountStr) return 0;
        const val = parseFloat(amountStr);
        if (isNaN(val)) return 0;
        return Number((val / exchangeRates.SUI!).toFixed(4));
    };

    // Process Gift 

    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    //Manual Delay Function
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleProcessPayment = async () => {

        // 1️⃣ Validation
        for (const [index, recipient] of recipients.entries()) {
            if (!recipient.address) {
                toast.error(`Recipient #${index + 1}: address is required`);
                return;
            }

            if (!isValidSuiAddress(recipient.address)) {
                toast.error(`Recipient #${index + 1}: invalid Sui address`);
                return;
            }

            if (!recipient.amount || Number(recipient.amount) <= 0) {
                toast.error(`Recipient #${index + 1}: amount must be greater than 0`);
                return;
            }
        }

        if (!suiStats) {
            toast.error('SUI stats not found');
            return;
        }

        // Ensure unique addresses
        const uniqueAddresses = new Set(recipients.map(r => r.address));
        if (uniqueAddresses.size !== recipients.length) {
            toast.error('All recipients must have unique addresses');
            return;
        }

        const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
        const TREASURY_ID = import.meta.env.VITE_TREASURY_ID;
        const MODULE_NAME = import.meta.env.VITE_MODULE_NAME;

        try {
            /* -------------------------------------------------
               1️⃣ Create gifts in backend & COLLECT gift IDs
            ------------------------------------------------- */

            const createdGifts = await Promise.all(
                recipients.map(recipient => {
                    const recipientFee =
                        inputMode === 'USD'
                            ? Number(recipient.amount) * PLATFORM_FEE_PERCENT + PLATFORM_FEE_BASE
                            : getRecipientValueInUSD(recipient.amount) * PLATFORM_FEE_PERCENT + PLATFORM_FEE_BASE;

                    const giftParams: SendGiftParams = {
                        senderWallet: account!.address,
                        receiverWallet: recipient.address,
                        amountUSD:
                            inputMode === 'USD'
                                ? Number(recipient.amount)
                                : getUSDToSUI(recipient.amount),
                        feeUSD: recipientFee,
                        suiStats,
                        totalTokenAmount:
                            inputMode === 'USD'
                                ? getUSDToSUI(recipient.amount + recipientFee)
                                : Number(recipient.amount + recipientFee),
                        tokenSymbol: 'sui',
                        wrapper: selectedWrapper.wrapperImg,
                        message,
                        chainId: 'sui',
                        isAnonymous: false,
                    };

                    return sendGift(giftParams); // must return {_id}
                })
            );

            console.log(createdGifts);

            /* -------------------------------------------------
               2️⃣ Build Sui transaction
            ------------------------------------------------- */

            const tx = new Transaction();
            tx.setGasBudget(10_000_000);

            // Calculate total required SUI
            let totalSuiRequired = 0;

            for (const r of recipients) {
                const giftUsd =
                    inputMode === 'USD'
                        ? Number(r.amount)
                        : getRecipientValueInUSD(r.amount);

                const feeUsd =
                    giftUsd * PLATFORM_FEE_PERCENT +
                    PLATFORM_FEE_BASE +
                    wrapperPrice;

                totalSuiRequired += giftUsd + feeUsd;
            }

            const totalMist = BigInt(
                Math.floor((totalSuiRequired / suiStats.suiPrice!) * 1e9)
            );

            // Split ONE payment coin
            const [paymentCoin] = tx.splitCoins(tx.gas, [totalMist]);

            /* -------------------------------------------------
               3️⃣ Loop recipients & use giftId from backend
            ------------------------------------------------- */

            recipients.forEach((recipient, index) => {
                const giftUsd =
                    inputMode === 'USD'
                        ? Number(recipient.amount)
                        : getRecipientValueInUSD(recipient.amount);

                const giftMist = BigInt(
                    Math.floor((giftUsd / suiStats.suiPrice!) * 1e9)
                );

                const [giftCoin] = tx.splitCoins(paymentCoin, [giftMist]);

                const giftId = createdGifts[index]._id; // ✅ MONGODB ID

                tx.moveCall({
                    target: `${PACKAGE_ID}::${MODULE_NAME}::wrap_gift`,
                    arguments: [
                        giftCoin,
                        paymentCoin, // mutable fee source
                        tx.pure.address(recipient.address),
                        tx.pure.string(giftId), // ✅ replaced ATULYADAV
                        tx.object(TREASURY_ID),
                    ],
                });
            });

            // Return leftover dust
            tx.transferObjects(
                [paymentCoin],
                tx.pure.address(account!.address)
            );

            /* -------------------------------------------------
               4️⃣ Sign & execute
            ------------------------------------------------- */

            signAndExecuteTransaction(
                { transaction: tx },
                {
                    onSuccess: async (result) => {
                        await verifyGift({
                            giftId: createdGifts[0]._id,
                            txDigest: result.digest,
                            address: account!.address,
                            verifyType: 'wrapGift'
                        });
                        toast.success('Gift sent successfully');
                        console.log(result);
                        onClose();
                    },
                    onError: () => {
                        toast.error('Failed to send gift');
                    },
                }
            );
        } catch (err) {
            console.error(err);
            toast.error('Unexpected error');
        }
    };



    const totalGiftValueUSD = recipients.reduce((acc, curr) => acc + getRecipientValueInUSD(curr.amount), 0);
    const wrapperPrice = (selectedWrapper?.priceUSD || 0) * recipients.length;
    console.log(wrapperPrice)
    // Fee is calculated on total volume
    const fee = (totalGiftValueUSD * PLATFORM_FEE_PERCENT) + PLATFORM_FEE_BASE;
    const total = totalGiftValueUSD + fee + wrapperPrice;

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
                                    {/* Upload Option for Premium */}
                                    {wrapperType === 'premium' && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-2xl cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-400 hover:text-blue-600 transition-all"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {isWrapperLoading ? <Loader2 className="animate-spin" /> : <Plus size={32} />}
                                            <span className="text-sm font-bold mt-2">Custom Wrapper</span>
                                        </div>
                                    )}

                                    {filteredWrappers.map((wrapper) => (
                                        <div
                                            key={wrapper._id}
                                            onClick={() => setSelectedWrapper(wrapper)}
                                            className={`relative aspect-square rounded-2xl cursor-pointer transition-all border-4 group ${selectedWrapper?._id === wrapper._id
                                                ? 'border-blue-400 scale-95'
                                                : 'border-transparent hover:scale-105'
                                                }`}
                                        >
                                            {/* Wrapper Image */}
                                            <img
                                                src={wrapper.wrapperImg}
                                                alt={wrapper.name || "Wrapper"}
                                                className="w-full h-full object-cover rounded-xl shadow-inner"
                                            />

                                            {/* Price Tag */}
                                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                                {wrapper.priceUSD === 0 ? 'FREE' : `$${wrapper.priceUSD}`}
                                            </div>

                                            {/* Delete Custom Wrapper */}
                                            {(typeof wrapper._id === 'string') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        deleteWrapper(wrapper._id);
                                                        toast.success("Wrapper deleted")

                                                    }}
                                                    className="absolute top-2 right-2 bg-red-100/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all z-10"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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
                                        src={selectedWrapper?.wrapperImg}
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
                                                                                    const rate = exchangeRates.SUI!;
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
                                                                        <AvatarImage src={COIN_ASSETS.SUI.logo} />
                                                                        <AvatarFallback>S</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-bold text-sm text-slate-700 flex-1 text-left">SUI</span>
                                                                    <ChevronRight className="rotate-90 text-slate-400" size={14} />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {(['SUI'] as const).map((c) => (
                                                                        <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="gap-2 p-2 cursor-pointer">
                                                                            <Avatar className="h-5 w-5">
                                                                                <AvatarImage src={COIN_ASSETS.SUI.logo} />
                                                                                <AvatarFallback>S</AvatarFallback>
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
                                        <span className="font-medium">{selectedWrapper?.priceUSD === 0 ? 'FREE' : `$${selectedWrapper?.priceUSD} (${recipients.length}x)`}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Processing Fee <span className="text-xs text-slate-400">1% {PLATFORM_FEE_BASE > 0 ? `+ $${PLATFORM_FEE_BASE}` : ''}</span></span>
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
                                                ≈ {`${getUSDToSUI(total.toString())} ${currency}`}
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
                            onClick={step === 4 ? handleProcessPayment : handleNext}
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
