import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useAuthActions, useAuthLoading } from '@/store';
import type { User } from '@/types/auth.types';
import toast from 'react-hot-toast';
import SocialIconDetector, { detectPlatform } from './SocialIconDetector';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
    const { updateProfile } = useAuthActions();
    const isLoading = useAuthLoading();

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner || null);

    // Bio is string[], but we edit as textarea string
    const [bioText, setBioText] = useState<string>(user.bio?.join('\n\n') || '');

    const [showGiftSent, setShowGiftSent] = useState<boolean>(
        user.settings?.show_gift_sent ?? true
    );

    const [socialLinks, setSocialLinks] = useState<{ id: string; link: string }[]>([]);

    // Reset state when opening/user changes
    useEffect(() => {
        if (isOpen && user) {
            setBannerPreview(user.banner || null);
            setBannerFile(null);
            setBioText(user.bio?.join('\n\n') || '');
            setShowGiftSent(user.settings?.show_gift_sent ?? true);

            if (user.socials && user.socials.length > 0) {
                setSocialLinks(user.socials.map(s => ({ id: crypto.randomUUID(), link: s.link })));
            } else {
                setSocialLinks([
                    { id: crypto.randomUUID(), link: '' },
                    { id: crypto.randomUUID(), link: '' }
                ]);
            }
        }
    }, [isOpen, user]);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit example
            toast.error("File size must be less than 5MB");
            return;
        }

        setBannerFile(file);
        const objectUrl = URL.createObjectURL(file);
        setBannerPreview(objectUrl);
    };

    const MAX_BIO_LENGTH = 400;

    // Social Links Handlers
    const addSocialLink = () => {
        if (socialLinks.length < 6) {
            setSocialLinks([...socialLinks, { id: crypto.randomUUID(), link: '' }]);
        }
    };

    const removeSocialLink = (id: string) => {
        setSocialLinks(socialLinks.filter(link => link.id !== id));
    };

    const handleLinkChange = (id: string, value: string) => {
        setSocialLinks(socialLinks.map(link =>
            link.id === id ? { ...link, link: value } : link
        ));
    };

    // Helper to get platform for placeholder/visuals
    const getPlaceholder = (index: number) => {
        if (index === 0) return "https://x.com/username";
        if (index === 1) return "https://discord.gg/invite";
        return "https://example.com/profile";
    };

    const handleSave = async () => {
        try {
            if (bioText.length > MAX_BIO_LENGTH) {
                toast.error(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`);
                return;
            }

            const bioArray = bioText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            // Process socials
            const processedSocials = socialLinks
                .map(item => ({
                    link: item.link.trim(),
                    platform: detectPlatform(item.link.trim())
                }))
                .filter(item => item.link.length > 0)
                // Remove duplicates
                .filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);

            await updateProfile({
                banner: bannerFile || undefined,
                bio: bioArray,
                settings: { show_gift_sent: showGiftSent },
                socials: processedSocials
            });

            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        className="relative bg-white w-full max-w-lg rounded-[2rem] border-[4px] border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b-[3px] border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 font-['Lilita_One'] tracking-wide">
                                EDIT PROFILE
                            </h2>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-900" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8">

                            {/* Banner Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    Profile Banner
                                </label>
                                <div className="relative w-full h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden group">
                                    {bannerPreview ? (
                                        <img
                                            src={bannerPreview}
                                            alt="Banner Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <label className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white mb-2" size={24} />
                                        <span className="text-white font-bold text-sm">Change Banner</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleBannerChange}
                                            disabled={isLoading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    About You
                                </label>

                                <textarea
                                    value={bioText}
                                    onChange={(e) => {
                                        if (e.target.value.length <= MAX_BIO_LENGTH) {
                                            setBioText(e.target.value);
                                        }
                                    }}
                                    disabled={isLoading}
                                    placeholder="Tell your story..."
                                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none min-h-[150px] font-medium resize-none text-slate-700 leading-relaxed placeholder:text-slate-400"
                                />

                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400 font-medium">
                                        We'll format separate paragraphs automatically.
                                    </p>

                                    <p
                                        className={`text-xs font-semibold ${bioText.length >= MAX_BIO_LENGTH
                                            ? 'text-red-500'
                                            : 'text-slate-400'
                                            }`}
                                    >
                                        {MAX_BIO_LENGTH - bioText.length} characters left
                                    </p>
                                </div>
                            </div>

                            {/* Social Links Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        Social Links
                                    </label>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                        {socialLinks.length}/6
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {socialLinks.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center gap-2 p-1 pl-3 pr-1 rounded-xl bg-slate-50 border-2 border-slate-200 focus-within:border-slate-900 focus-within:bg-white transition-all hover:border-slate-300"
                                        >
                                            <div className="text-slate-400 group-focus-within:text-[#F472B6] transition-colors">
                                                <SocialIconDetector url={item.link} className="w-5 h-5 translate-y-[1px]" />
                                            </div>

                                            <input
                                                type="text"
                                                value={item.link}
                                                onChange={(e) => handleLinkChange(item.id, e.target.value)}
                                                placeholder={getPlaceholder(index)}
                                                disabled={isLoading}
                                                className="flex-1 bg-transparent py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                            />

                                            {/* Only show remove button if user has more than 1 field, or maybe always allow removing? 
                                                Prompt said "Append ... Stop adding ... Prevent adding more than 6".
                                                Does not explicitly mention removing, but it's standard.
                                                Let's allow removing any item. 
                                            */}
                                            <button
                                                onClick={() => removeSocialLink(item.id)}
                                                disabled={isLoading}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove link"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {socialLinks.length < 6 && (
                                    <button
                                        onClick={addSocialLink}
                                        disabled={isLoading}
                                        className="mt-2 text-xs font-black text-slate-500 hover:text-[#F472B6] flex items-center gap-1 transition-colors px-2 py-1"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                        ADD LINK
                                    </button>
                                )}
                            </div>

                            {/* Settings Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                    Privacy Settings
                                </label>

                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 bg-slate-50">
                                    <div>
                                        <div className="font-bold text-slate-900">Show Sent Gifts</div>
                                        <div className="text-sm text-slate-500 font-medium">
                                            Display gifts you've sent on your public profile
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => !isLoading && setShowGiftSent(!showGiftSent)}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors border-2 ${showGiftSent
                                            ? 'bg-[#4ADE80] border-slate-900'
                                            : 'bg-slate-200 border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${showGiftSent ? 'translate-x-[22px]' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t-[3px] border-slate-100 flex items-center justify-end gap-3 bg-white">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-8 py-3 bg-[#F472B6] text-slate-900 rounded-xl font-black border-[3px] border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        SAVING...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        SAVE CHANGES
                                    </>
                                )}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
