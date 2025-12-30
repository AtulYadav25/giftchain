import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BarChart2, Save, X, Instagram, Twitter, Globe, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useUser, useAuthActions } from '@/store';
import toast from 'react-hot-toast';

const DashboardSettings = () => {
    const user = useUser();
    const { updateProfile } = useAuthActions(); // Assumption: updateProfile exists
    const [activeTab, setActiveTab] = useState<'profile' | 'analytics'>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [bio, setBio] = useState(user?.bio || "Just a creator spreading joy! ✨");
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [showSent, setShowSent] = useState(true);
    const [showReceived, setShowReceived] = useState(true);
    const [gaId, setGaId] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        // Mock save
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Settings saved successfully!");
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-['Lilita_One'] text-slate-900 tracking-wide">Settings</h1>

            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-xl border-[3px] border-slate-900 w-fit shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'profile'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <User size={18} /> Profile
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'analytics'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <BarChart2 size={18} /> Analytics
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2rem] border-[4px] border-slate-900 p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)]">

                {activeTab === 'profile' ? (
                    <div className="space-y-8">
                        {/* Bio */}
                        <div className="space-y-3">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="bg-[#FFD166] w-2 h-6 rounded-full inline-block"></span>
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-slate-900 rounded-xl px-4 py-3 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors resize-none"
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="bg-[#4ADE80] w-2 h-6 rounded-full inline-block"></span>
                                Social Links
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Twitter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        placeholder="Twitter Username"
                                        className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-slate-900 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-900 outline-none transition-colors"
                                    />
                                </div>
                                <div className="relative">
                                    <Instagram size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="Instagram Username"
                                        className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-slate-900 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-900 outline-none transition-colors"
                                    />
                                </div>
                                <div className="relative md:col-span-2">
                                    <Globe size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="Personal Website URL"
                                        className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-slate-900 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-900 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="bg-[#60A5FA] w-2 h-6 rounded-full inline-block"></span>
                                Privacy
                            </label>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-slate-300 transition-colors">
                                    <span className="font-bold text-slate-700">Show Sent Gifts on Profile</span>
                                    <button onClick={() => setShowSent(!showSent)} className="text-slate-900 transition-colors">
                                        {showSent ? <ToggleRight size={40} className="fill-slate-900 text-white" /> : <ToggleLeft size={40} className="text-slate-300" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-slate-300 transition-colors">
                                    <span className="font-bold text-slate-700">Show Received Gifts on Profile</span>
                                    <button onClick={() => setShowReceived(!showReceived)} className="text-slate-900 transition-colors">
                                        {showReceived ? <ToggleRight size={40} className="fill-slate-900 text-white" /> : <ToggleLeft size={40} className="text-slate-300" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="bg-[#F472B6] w-2 h-6 rounded-full inline-block"></span>
                                Google Analytics
                            </label>
                            <p className="text-slate-500 text-sm font-medium mb-2">
                                Enter your Measurement ID (G-XXXXXXXXXX) to track visits to your public profile.
                            </p>
                            <input
                                type="text"
                                value={gaId}
                                onChange={(e) => setGaId(e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full bg-slate-50 border-[3px] border-slate-200 focus:border-slate-900 rounded-xl px-4 py-3 font-mono font-bold text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-8 border-t-[3px] border-slate-100">
                    <button className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-8 py-3 bg-[#4ADE80] text-slate-900 border-[3px] border-slate-900 rounded-xl font-black shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </motion.button>
                </div>

            </div>
        </div>
    );
};

export default DashboardSettings;
