
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dark text-text-primary relative overflow-hidden selection:bg-primary/30">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 z-9999 pointer-events-none opacity-[0.04] bg-noise mix-blend-overlay"></div>

            {/* Background Cinematic Gradients (Orbs) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Top Left Haze */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />

                {/* Central liquid orb (WebP Image) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-60 animate-pulse-slow mix-blend-screen pointer-events-none blur-[80px]">
                    <img
                        src={`${import.meta.env.BASE_URL}orbe.webp`}
                        alt="Background Orb"
                        className="w-full h-full object-contain"
                        fetchpriority="high"
                    />
                </div>

                {/* Bottom Right Haze */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-pink/5 rounded-full blur-[100px]" />
            </div>

            {/* Mobile Header / Trigger */}
            <div className={`md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${isMobileOpen ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="pointer-events-auto p-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-lg active:scale-95 transition-transform"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

            {/* Main Content Area - Responsive Padding */}
            <main className="relative z-10 p-4 pt-20 md:pt-4 md:pl-32 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
