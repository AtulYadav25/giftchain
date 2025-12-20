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
    username: string;
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
    const { sendGift, verifyGift, resolveRecipients } = useGiftActions();

    // SUI Price
    const { getSUIPrice } = useGiftActions();
    const { suiStats } = useGiftStore((s) => s);

    const exchangeRates = useMemo(() => ({
        SUI: suiStats.suiPrice
    }), [suiStats]);

    // Recipient State
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: '1', username: '', address: '', amount: '' }
    ]);

    // Simulate loading when amount changes
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
        setRecipients([...recipients, { id: Date.now().toString(), username: '', address: '', amount: '' }]);
    };

    const removeRecipient = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
        setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    // Modified Logic for Address/Username Input
    const updateRecipientAddressOrUsername = (id: string, value: string) => {
        const isAddress = value.startsWith('0x'); // Minimal heuristic
        setRecipients(recipients.map(r => {
            if (r.id !== id) return r;
            return {
                ...r,
                address: isAddress ? value : '', // Assuming backend validation requires address, but user asked for this split
                username: !isAddress ? value : ''
            };
        }));
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

    const handleProcessPayment = async () => {

        // 1️⃣ Validation
        // Collect usernames that need resolving
        const usernamesToResolve = recipients
            .filter(r => !r.address && r.username)
            .map(r => r.username);

        // Resolve only if needed
        let resolvedMap = new Map<string, string>();

        if (usernamesToResolve.length > 0) {
            const resolved = await resolveRecipients(usernamesToResolve);
            // resolved = [{ username, address }]

            resolved.forEach(u => {
                resolvedMap.set(u.username, u.address);
            });
        }

        const finalRecipients = recipients.map(r => {
            // If address already exists, trust it
            if (r.address) return r;

            // Resolve via username
            const resolvedAddress = resolvedMap.get(r.username);

            if (!resolvedAddress) {
                console.log(`Invalid username: ${r.username}`);
                toast.error(`Invalid username: ${r.username}`);
                return r;
            }

            return {
                ...r,
                address: resolvedAddress,
            };
        });



        for (const [index, recipient] of finalRecipients.entries()) {
            if (!recipient.address) {
                // NOTE: This will trip if user only enters a username, but instruction says DO NOT CHANGE VALIDATION/LOGIC
                // The user logic implies they want the input to "treat it as username" in state.
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
            toast.error('All recipients must be unique');
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

    // Fee is calculated on total volume
    const fee = (totalGiftValueUSD * PLATFORM_FEE_PERCENT) + PLATFORM_FEE_BASE;
    const total = totalGiftValueUSD + fee + wrapperPrice;

    const handleNext = () => setStep(s => Math.min(4, s + 1) as Step);
    const handleBack = () => setStep(s => Math.max(1, s - 1) as Step);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #F1F5F9; 
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: #CBD5E1; 
                        border-radius: 4px;
                    }
                `}</style>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[16px_16px_0_0_rgba(15,23,42,1)] border-[4px] border-slate-900 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header - Playful Pop Theme */}
                    <div className="p-6 border-b-[4px] border-slate-900 flex justify-between items-center bg-[#FFD166] relative overflow-hidden">
                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:12px_12px]"></div>

                        <h2 className="text-2xl font-['Lilita_One'] text-slate-900 flex items-center gap-2 relative z-10 tracking-wide">
                            {step === 1 && <><Gift className="text-slate-900 fill-pink-400" strokeWidth={2.5} /> Choose Wrapper</>}
                            {step === 2 && <><MessageCircle className="text-slate-900 fill-blue-400" strokeWidth={2.5} /> Write Message</>}
                            {step === 3 && <><Coins className="text-slate-900 fill-green-400" strokeWidth={2.5} /> Add Recipients</>}
                            {step === 4 && <><Check className="text-slate-900 fill-white" strokeWidth={3} /> Review & Send</>}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white border-2 border-slate-900 text-slate-900 hover:scale-110 active:scale-95 transition-all rounded-full shadow-[2px_2px_0_0_rgba(15,23,42,1)] relative z-10"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar bg-slate-50">

                        {/* Step 1: Wrapper Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="font-lexend flex bg-white border-2 border-slate-200 p-1 rounded-full w-fit mx-auto shadow-sm">
                                    <button
                                        onClick={() => setWrapperType('free')}
                                        className={`px-6 py-2 font-bold rounded-full text-sm  transition-all ${wrapperType === 'free' ? 'bg-[#4ADE80] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Free Wrappers
                                    </button>
                                    <button
                                        onClick={() => setWrapperType('premium')}
                                        className={`px-6 py-2 font-bold rounded-full text-sm transition-all ${wrapperType === 'premium' ? 'bg-[#F472B6] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Premium
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Upload Option for Premium */}
                                    {wrapperType === 'premium' && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-2xl cursor-pointer border-[3px] border-dashed border-slate-300 hover:border-slate-900 hover:bg-white flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-all bg-white"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {isWrapperLoading ? <Loader2 className="animate-spin" /> : <Plus size={32} strokeWidth={2.5} />}
                                            <span className="text-sm font-bold mt-2 font-lexend">Custom</span>
                                        </div>
                                    )}

                                    {filteredWrappers.map((wrapper) => (
                                        <div
                                            key={wrapper._id}
                                            onClick={() => setSelectedWrapper(wrapper)}
                                            className={`relative aspect-square rounded-2xl cursor-pointer transition-all border-[4px] group overflow-hidden bg-white ${selectedWrapper?._id === wrapper._id
                                                ? 'border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)] scale-[0.98]'
                                                : 'border-transparent shadow-sm hover:scale-[1.02]'
                                                }`}
                                        >
                                            {/* Wrapper Image */}
                                            <img
                                                src={wrapper.wrapperImg}
                                                alt={wrapper.name || "Wrapper"}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Price Tag */}
                                            <div className="absolute bottom-2 right-2 bg-white border-2 border-slate-900 px-2 py-0.5 rounded-lg text-xs font-black text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
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
                                                    className="absolute top-2 right-2 bg-red-100 text-red-500 border-2 border-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all z-10"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            )}

                                            {/* Selection Check */}
                                            {selectedWrapper?._id === wrapper._id && (
                                                <div className="absolute top-2 left-2 bg-[#4ADE80] border-2 border-slate-900 p-1 rounded-full text-slate-900">
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
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
                                    <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Your Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={600}
                                        placeholder="Write something sweet..."
                                        className="w-full h-40 p-5 rounded-2xl bg-white border-[3px] border-slate-200 focus:border-slate-900 focus:ring-0 resize-none transition-all placeholder:text-slate-300 text-slate-700 text-lg shadow-sm"
                                    />
                                    <div className="text-right text-xs text-slate-400 mt-2 font-bold">{message.length}/600</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">Or choose a template:</label>
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {Object.keys(MESSAGE_TEMPLATES).map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(tag as any)}
                                                className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all border-2 ${selectedTag === tag ? 'bg-[#60A5FA] text-white border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
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
                                                className="text-left p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-900 hover:shadow-[4px_4px_0_0_rgba(203,213,225,1)] transition-all active:scale-[0.99] active:shadow-none"
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
                                <div className="flex items-center gap-4 bg-[#E0F2FE] border-2 border-slate-900 p-4 rounded-2xl mb-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    {/* Wrapper Image */}
                                    <img
                                        src={selectedWrapper?.wrapperImg}
                                        alt="Selected wrapper"
                                        className="w-14 h-14 rounded-lg object-cover border-2 border-slate-900 bg-white"
                                    />

                                    {/* Message */}
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-blue-500 uppercase tracking-widest mb-0.5">Attached Note</div>
                                        <p className="text-sm text-slate-700 line-clamp-2 italic font-lexend font-medium">
                                            "{message || "No message"}"
                                        </p>
                                    </div>
                                </div>


                                <div className="space-y-6 font-lexend">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Recipients</label>
                                        <button
                                            onClick={() => setInputMode(m => m === 'USD' ? 'TOKEN' : 'USD')}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200"
                                        >
                                            Mode: {inputMode === 'USD' ? currency : 'USD'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {recipients.map((recipient, index) => (
                                            <motion.div
                                                key={recipient.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border-[3px] border-slate-900 p-5 rounded-2xl shadow-[6px_6px_0_0_rgba(15,23,42,1)] relative group"
                                            >
                                                {recipients.length > 1 && (
                                                    <button
                                                        onClick={() => removeRecipient(recipient.id)}
                                                        className="absolute -right-3 -top-3 bg-[#FB7185] text-white border-2 border-slate-900 p-1.5 rounded-full shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:scale-110 transition-all z-10"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}

                                                <div className="grid gap-5">
                                                    {/* Amount Row */}
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-500 ml-1 mb-1 block font-bold uppercase">Amount ({inputMode})</label>
                                                            <div className="relative flex items-center">
                                                                <InputGroup className="bg-white">
                                                                    <InputGroupInput
                                                                        type="number"
                                                                        value={recipient.amount}
                                                                        onChange={(e) => updateRecipient(recipient.id, "amount", e.target.value)}
                                                                        placeholder="0.00"
                                                                        className="h-12 text-lg font-bold pr-2 bg-transparent"
                                                                    />
                                                                    <InputGroupAddon>
                                                                        <InputGroupText className="font-bold text-slate-500">{inputMode === 'USD' ? '$' : currency}</InputGroupText>
                                                                    </InputGroupAddon>
                                                                    <InputGroupAddon align="inline-end" className="min-w-[80px] justify-end">
                                                                        <InputGroupText className="text-slate-400 text-xs font-bold pt-1">
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

                                                        {/* Currency Dropdown */}
                                                        <div className="w-[140px]">
                                                            <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Currency</label>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger className="w-full flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-500 h-12 px-3 rounded-lg transition-colors outline-none">
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

                                                    {/* Wallet Address / Username Row - MODIFIED */}
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block uppercase">Recipient</label>
                                                        <Input
                                                            value={recipient.address || recipient.username}
                                                            onChange={(e) => updateRecipientAddressOrUsername(recipient.id, e.target.value)}
                                                            placeholder="Enter username or 0x address"
                                                            className="h-12 font-mono text-sm bg-slate-50 border-slate-200 focus:border-slate-500 focus:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={addRecipient}
                                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:bg-white hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2 bg-slate-50"
                                    >
                                        <Plus size={20} strokeWidth={3} /> Add Another Recipient
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Billing */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="bg-white font-lexend border-[3px] border-slate-900 rounded-2xl p-6 space-y-4 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                                    <h3 className="text-xl font-black text-slate-900 mb-4 border-b-2 border-slate-100 pb-2">Gift Summary</h3>

                                    {/* Recipient List */}
                                    <div className="space-y-3 mb-6">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Recipients ({recipients.length})</label>
                                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 max-h-40 overflow-y-auto space-y-3 custom-scrollbar">
                                            {recipients.map((r, i) => {
                                                const val = parseFloat(r.amount) || 0;
                                                const displayAmount = inputMode === 'USD' ? `$${val}` : `${val} ${currency}`;
                                                return (
                                                    <div key={r.id} className="flex justify-between items-center text-sm group">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">#{i + 1}</div>
                                                            <span className="text-slate-700 font-mono truncate max-w-[150px] font-medium" title={r.address || r.username}>
                                                                {r.username ? `@${r.username}` : (r.address || 'Missing Address')}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{displayAmount}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-slate-600">
                                            <span className="font-medium">Subtotal Gift Amount</span>
                                            <span className="font-bold text-slate-900">
                                                $
                                                {Number(totalGiftValueUSD).toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-slate-600">
                                            <span className="font-medium">Wrapper ({selectedWrapper?.name})</span>
                                            <span className="font-bold text-slate-900">{selectedWrapper?.priceUSD === 0 ? 'FREE' : `$${selectedWrapper?.priceUSD} (${recipients.length}x)`}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span className="font-medium">Processing Fee <span className="text-xs text-slate-400 bg-slate-100 px-1 rounded">1%</span></span>
                                            <span className="font-bold text-slate-900">${fee.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}</span>
                                        </div>
                                    </div>

                                    <div className="border-t-[3px] border-dashed border-slate-200 pt-4 mt-4 flex justify-between items-end">
                                        <span className="font-black text-slate-900 text-xl">Total</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-blue-600 tracking-tighter">${total.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}</div>
                                            <div className="text-xs font-bold text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1">
                                                ≈ {`${getUSDToSUI(total.toString())} ${currency}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#FFFBEB] text-slate-900 p-4 rounded-xl text-sm border-l-[6px] border-[#FCD34D] shadow-sm flex items-start gap-3">
                                    <Sparkles className="shrink-0 mt-0.5 text-yellow-600" size={18} />
                                    <p className="font-medium leading-relaxed">Your gifts will be wrapped instantly and sent to all recipients! They'll see a fun reveal animation when they open it.</p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Navigation */}
                    <div className="p-6 border-t-[4px] border-slate-900 bg-white flex justify-between items-center relative z-20">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-2xl font-lexend text-slate-900 font-bold flex items-center gap-2 transition-all bg-white border-[3px] border-slate-900 shadow-[4px_4px_0_0_#CBD5E1] hover:bg-slate-50 active:shadow-none active:translate-y-[4px]"
                            >
                                <ChevronLeft size={20} strokeWidth={3} /> Back
                            </button>
                        ) : <div />}

                        <button
                            onClick={step === 4 ? handleProcessPayment : handleNext}
                            disabled={step === 1 && !selectedWrapper}
                            className={`px-8 py-3 rounded-2xl font-black font-lexend text-slate-900 flex items-center gap-2 transition-all active:translate-y-[4px] active:shadow-none ${step === 4
                                ? 'bg-[#4ADE80] hover:bg-[#22c55e] w-full md:w-auto justify-center border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] text-lg'
                                : 'bg-[#F472B6] hover:bg-[#ec4899] border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]'
                                } ${(!selectedWrapper && step === 1) ? 'opacity-50 cursor-not-allowed shadow-none border-slate-300 bg-slate-100 text-slate-400' : ''}`}
                        >
                            {step === 4 ? (
                                <>Wrap & Send Love <Gift className="animate-bounce" /> 🎁</>
                            ) : (
                                <>Next Step <ChevronRight size={20} strokeWidth={3} /></>
                            )}
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}