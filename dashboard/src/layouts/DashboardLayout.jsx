
import Sidebar from './Sidebar';
import AppBackground from '../components/ui/AppBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, hideNavigation = false }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dark text-text-primary relative overflow-hidden selection:bg-primary/30">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 z-9999 pointer-events-none opacity-[0.04] bg-noise mix-blend-overlay"></div>

            {/* Global Glass Warm-up Layer (Ensures GPU Backdrop-Filter cache remains hot) */}
            <div
                className="fixed bottom-0 left-0 w-full h-px opacity-[0.003] pointer-events-none z-[-1]"
                style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    animation: 'backdrop-keepalive 0.5s linear infinite'
                }}
            />

            {/* Background Shader - GrainGradient */}
            <AppBackground />

            {/* Mobile Header / Trigger - Hidden if hideNavigation is true */}
            {!hideNavigation && (
                <div className={`md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${isMobileOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                    <button
                        id="mobile-menu-trigger"
                        onClick={() => setIsMobileOpen(true)}
                        className="pointer-events-auto p-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg active:scale-95 transition-transform"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!hideNavigation && (
                    <motion.div
                        key="sidebar"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed z-40 h-full"
                    >
                        <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area - Responsive Padding */}
            {/* If navigation is hidden, remove the left padding reserve for sidebar */}
            <main className={`relative z-10 p-4 pt-20 md:pt-4 min-h-screen ${hideNavigation ? '' : 'md:pl-32'}`}>
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
