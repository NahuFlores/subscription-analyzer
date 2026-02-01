import { BarChart2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import { useState, useEffect } from 'react';

const Sidebar = ({ isMobileOpen, closeMobile }) => {
    const [activeTab, setActiveTab] = useState('Analytics');
    const [isHovered, setIsHovered] = useState(false);
    const [isLogoutBtnHovered, setIsLogoutBtnHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                    fixed top-1/2 -translate-y-1/2 h-[calc(100vh-2rem)] 
                    z-50 
                    bg-dark/90 md:bg-transparent
                    flex flex-col overflow-hidden
                    left-4 md:left-6
                    will-change-[width,transform,opacity]
                `}
            >
                {/* Gradient Border Glow (Simulated with absolute div) */}
                <div className="absolute inset-0 rounded-[24px] p-px -z-10 bg-linear-to-b from-primary/20 via-accent-purple/10 to-accent-pink/20 opacity-50 pointer-events-none" />

                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-white/5 relative shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="SubAnalyzer Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    </div>

                    <AnimatePresence>
                        {(isHovered || isMobileOpen || isMobile) && (
                            <motion.span
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
                            <button onClick={closeMobile} className="md:hidden ml-auto text-white/50 hover:text-white">
                                <LogOut size={20} className="rotate-180" />
                            </button>
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
