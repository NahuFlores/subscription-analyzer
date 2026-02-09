import { BarChart2, LogOut, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import { useState, useEffect } from 'react';
import { API_BASE_URL, USER_ID } from '../config/api';

const Sidebar = ({ isMobileOpen, closeMobile }) => {
    const [activeTab, setActiveTab] = useState('Analytics');
    const [isHovered, setIsHovered] = useState(false);
    const [isLogoutBtnHovered, setIsLogoutBtnHovered] = useState(false);
    const [isDemoBtnHovered, setIsDemoBtnHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [demoStatus, setDemoStatus] = useState('idle'); // idle, loading, success, error

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLoadDemoData = async () => {
        if (demoStatus === 'loading') return;

        setDemoStatus('loading');
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/seed-demo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID })
            });

            if (response.ok) {
                setDemoStatus('success');
                // Refresh page after short delay to show new data
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setDemoStatus('error');
                setTimeout(() => setDemoStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Error loading demo data:', error);
            setDemoStatus('error');
            setTimeout(() => setDemoStatus('idle'), 3000);
        }
    };

    const getDemoButtonContent = () => {
        switch (demoStatus) {
            case 'loading':
                return { icon: Loader2, text: 'Loading...', className: 'animate-spin' };
            case 'success':
                return { icon: Check, text: 'Loaded!', className: 'text-green-400' };
            case 'error':
                return { icon: AlertCircle, text: 'Error', className: 'text-red-400' };
            default:
                return { icon: Sparkles, text: 'Load Demo Data', className: '' };
        }
    };

    const demoContent = getDemoButtonContent();

    const menuItems = [
        { icon: BarChart2, label: 'Analytics' },
    ];

    // Mobile Overlay
    const MobileOverlay = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
    );

    return (
        <>
            <AnimatePresence>
                {isMobileOpen && <MobileOverlay />}
            </AnimatePresence>

            <GlassCard
                as={motion.aside} // Forward 'as' prop if supported or just accept div. GlassCard uses motion.div directly. I'll rely on motion.div.
                initial={false}
                animate={{
                    width: isMobile ? (isMobileOpen ? '280px' : '0px') : (isHovered ? '280px' : '80px'),
                    x: isMobile && !isMobileOpen ? -100 : 0,
                    opacity: isMobile && !isMobileOpen ? 0 : 1
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed top-1/2 -translate-y-1/2 h-[calc(100dvh-2rem)] 
                    z-50 
                    md:bg-transparent!
                    flex flex-col overflow-hidden
                    left-4 md:left-6
                    will-change-[width,transform,opacity]
                    animate-[backdrop-keepalive_0.1s_linear_infinite]
                `}
                style={{
                    backdropFilter: 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(150%)'
                }}
            >
                {/* Gradient Border - Matches magic-navbar vibe */}
                <div className="absolute inset-0 rounded-[24px] p-px -z-10 bg-linear-to-b from-white/30 via-white/5 to-white/10 opacity-50 pointer-events-none" />

                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-white/5 relative shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="SubAnalyzer Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    </div>

                    <AnimatePresence>
                        {(isHovered || isMobileOpen || isMobile) && (
                            <motion.span
                                key="logo-text"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="ml-4 font-bold text-lg tracking-wide whitespace-nowrap bg-clip-text text-transparent bg-linear-to-r from-white to-white/70"
                            >
                                SubAnalyzer
                            </motion.span>
                        )}

                        {/* Mobile Close Button */}
                        {isMobileOpen && (
                            <motion.button
                                key="close-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeMobile}
                                className="md:hidden ml-auto text-white/50 hover:text-white"
                            >
                                <LogOut size={20} className="rotate-180" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Menu */}
                <nav className="flex-1 flex flex-col gap-2 w-full p-4 mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActiveTab(item.label);
                                if (window.innerWidth < 768) closeMobile();
                            }}
                            aria-label={item.label}
                            className={`relative group flex items-center rounded-xl transition-all duration-300 w-full overflow-hidden h-12 text-left
                            ${activeTab === item.label ? 'text-white' : 'text-text-secondary/60 hover:text-white hover:bg-white/5'}`}
                        >
                            {/* Active BG Indicator */}
                            {activeTab === item.label && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className="w-[48px] h-full flex items-center justify-center shrink-0 relative z-10">
                                <item.icon size={22} strokeWidth={2} className={activeTab === item.label ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : ""} />
                            </div>

                            {/* Label */}
                            <AnimatePresence>
                                {(isHovered || isMobileOpen) && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-1 text-sm font-medium whitespace-nowrap relative z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </nav>

                {/* Demo Data Button */}
                <div className="px-4 pb-2">
                    <button
                        id="demo-data-btn"
                        onClick={handleLoadDemoData}
                        onMouseEnter={() => setIsDemoBtnHovered(true)}
                        onMouseLeave={() => setIsDemoBtnHovered(false)}
                        disabled={demoStatus === 'loading' || demoStatus === 'success'}
                        aria-label="Load Demo Data"
                        className={`relative group flex items-center rounded-xl transition-all duration-300 w-full overflow-hidden h-12 text-left cursor-pointer z-20
                            ${demoStatus === 'success' ? 'text-green-400' : demoStatus === 'error' ? 'text-red-400' : 'text-accent-purple/80 hover:text-accent-purple'}
                            ${demoStatus === 'loading' || demoStatus === 'success' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {/* Dynamic Background */}
                        <AnimatePresence>
                            {(isDemoBtnHovered && demoStatus === 'idle') && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-accent-purple/10 border border-accent-purple/20 rounded-xl"
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </AnimatePresence>

                        <div className="w-[48px] h-full flex items-center justify-center shrink-0 relative z-10">
                            <demoContent.icon
                                size={22}
                                strokeWidth={2}
                                className={`${demoContent.className} ${isDemoBtnHovered && demoStatus === 'idle' ? "text-accent-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : ""}`}
                            />
                        </div>
                        <AnimatePresence>
                            {(isHovered || isMobileOpen) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 text-sm font-medium whitespace-nowrap relative z-10"
                                >
                                    {demoContent.text}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Logout */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={() => window.location.href = '/'}
                        onMouseEnter={() => setIsLogoutBtnHovered(true)}
                        onMouseLeave={() => setIsLogoutBtnHovered(false)}
                        aria-label="Logout"
                        className="relative group flex items-center rounded-xl transition-all duration-300 w-full overflow-hidden h-12 text-left text-danger/80 hover:text-danger cursor-pointer z-20"
                    >
                        {/* Dynamic Background (Matches Active Pill style but Red) */}
                        <AnimatePresence>
                            {isLogoutBtnHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-danger/10 border border-danger/20 rounded-xl"
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </AnimatePresence>

                        <div className="w-[48px] h-full flex items-center justify-center shrink-0 relative z-10">
                            <LogOut
                                size={22}
                                strokeWidth={2}
                                className={isLogoutBtnHovered ? "text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}
                            />
                        </div>
                        <AnimatePresence>
                            {(isHovered || isMobileOpen) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 text-sm font-medium whitespace-nowrap relative z-10"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </GlassCard>
        </>
    );
};

export default Sidebar;

