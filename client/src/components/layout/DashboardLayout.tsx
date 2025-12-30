import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Gift,
    Target,
    User,
    Settings,
    Menu,
    X,
    LogOut,
    ExternalLink,
    Store
} from 'lucide-react';
import { useUser } from '@/store';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to?: string, icon: any, label: string, onClick?: () => void }) => {
    const location = useLocation();
    const isActive = to ? location.pathname === to : false;

    const content = (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-lexend font-bold text-lg
            ${isActive
                ? 'bg-white text-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] border-2 border-slate-900 translate-x-1'
                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
            }
        `}>
            <Icon size={22} strokeWidth={2.5} />
            <span>{label}</span>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {content}
            </button>
        );
    }

    return (
        <NavLink to={to!} className="block w-full">
            {content}
        </NavLink>
    );
};

const DashboardLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = useUser();
    const navigate = useNavigate();

    const handleViewPage = () => {
        if (user?.username) {
            window.open(`/${user.username}`, '_blank');
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#f9fbff] border-r-[3px] border-slate-900 p-6">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="bg-[#F472B6] p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <Gift size={24} className="text-slate-900" />
                </div>
                <h1 className="font-['Lilita_One'] text-2xl text-slate-900 tracking-wide">GiftChain</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <SidebarItem to="/dashboard/home" icon={Home} label="Home" />
                <SidebarItem onClick={handleViewPage} icon={ExternalLink} label="View Your Page" />
                <SidebarItem to="/hall-of-givers" icon={Store} label="Explore Creators" />
                <SidebarItem to="/dashboard/gifts" icon={Gift} label="Gifts" />
                <SidebarItem to="/dashboard/goals" icon={Target} label="Goals" />
                <SidebarItem to="/profile" icon={User} label="Profile" />
                <SidebarItem to="/dashboard/settings" icon={Settings} label="Settings" />
            </nav>

            <div className="mt-auto pt-6 border-t-2 border-slate-200">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-900 overflow-hidden">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.address ? `${user.address.slice(0, 4)}...${user.address.slice(-4)}` : ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f6ff]">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b-2 border-slate-900">
                <div className="flex items-center gap-2">
                    <div className="bg-[#F472B6] p-1.5 rounded-lg border-2 border-slate-900">
                        <Gift size={20} className="text-slate-900" />
                    </div>
                    <span className="font-['Lilita_One'] text-xl text-slate-900">GiftChain</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 bg-slate-100 rounded-lg border-2 border-slate-900 active:translate-y-1 transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-72 h-screen sticky top-0">
                    {sidebarContent}
                </aside>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden"
                            >
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 bg-slate-100 rounded-full border-2 border-slate-900"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                {sidebarContent}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
