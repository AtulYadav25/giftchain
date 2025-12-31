import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';
import { useAuthActions } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface UsernameSetupModalProps {
    isOpen: boolean;
}

export default function UsernameSetupModal({ isOpen }: UsernameSetupModalProps) {
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { updateProfile, checkUsernameAvailability } = useAuthActions();

    // Debounce check
    useEffect(() => {
        setIsAvailable(null);
        setIsValid(false);

        if (!username) return;

        // Basic validation
        if (username.length < 3) {
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);

            if (username === 'admin' || username === 'profile') {
                setIsAvailable(false);
                setIsValid(false);
                setIsChecking(false);
                return;
            }

            const isAvailable = await checkUsernameAvailability(username);
            setIsAvailable(isAvailable);
            setIsValid(isAvailable);
            setIsChecking(false);

        }, 600);

        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async () => {
        if (!isValid || !isAvailable) return;

        setIsSubmitting(true);
        try {

            updateProfile({ username });
            toast.success(`Welcome, ${username}!`);
        } catch (error) {
            toast.error("Failed to set username");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center border-4 border-blue-50"
                >
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 shadow-sm">
                            Hii
                        </div>
                        <h2 className="font-['Lilita_One'] text-3xl text-blue-900">Choose your Username</h2>
                        <p className="text-slate-500 font-main">
                            It looks like you're new here! Pick a unique username to get started.
                        </p>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className={`w-full bg-slate-50 border-2 rounded-xl py-4 pl-4 pr-12 text-lg font-bold outline-none transition-colors ${isAvailable === true ? 'border-green-400 focus:border-green-500' :
                                isAvailable === false ? 'border-red-400 focus:border-red-500' :
                                    'border-slate-200 focus:border-blue-400'
                                }`}
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {isChecking ? (
                                <Loader2 className="animate-spin text-blue-400" size={20} />
                            ) : isAvailable === true ? (
                                <Check className="text-green-500" size={20} />
                            ) : isAvailable === false ? (
                                <X className="text-red-500" size={20} />
                            ) : null}
                        </div>
                    </div>

                    {isAvailable === false && (
                        <p className="text-red-400 text-sm font-bold -mt-4 text-left pl-1">
                            Username is already taken
                        </p>
                    )}
                    {username && username.length < 3 && (
                        <p className="text-slate-400 text-sm font-bold -mt-4 text-left pl-1">
                            Must be at least 3 characters
                        </p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || !isAvailable || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${!isValid || !isAvailable || isSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                        Continue
                    </button>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
