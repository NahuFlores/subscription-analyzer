import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * LiquidModal - Premium UI/UX Component
 * 
 * Features:
 * - "Liquid" glass effect with high saturation and blur
 * - Smooth entrance/exit animations using AnimatePresence
 * - Native performance optimization (no heavy shaders)
 * - Built-in scroll handling to prevent layout issues
 * - NEW: SVG-based static liquid refraction
 */
const LiquidModal = ({
    isOpen,
    onClose,
    children,
    className = ""
}) => {

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                >


                    {/* Backdrop - Smooth Fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        aria-hidden="true"
                    />

                    {/* Modal Content - Liquid Glass Style */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.23, 1, 0.32, 1] // Efficient "easeOutQuint"ish curve
                        }}
                        className={twMerge(`
                            relative w-full max-w-lg overflow-hidden
                            bg-[#0f1218]/30 
                            backdrop-blur-xl saturate-150
                            border border-white/10 rounded-[32px]
                            shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]
                            flex flex-col
                        `, className)}
                        style={{
                            // Apply the SVG filter for true liquid refraction
                            // Note: backdrop-filter support for SVG is limited, so we use filter on the container
                            // combined with a backdrop-filter on the background.
                            boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5), inset 0 0 24px rgba(255,255,255,0.02), inset 0 0.5px 0.5px rgba(255,255,255,0.2)"
                        }}
                    >
                        {/* Noise Texture for Premium Feel */}
                        <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                            style={{ backgroundImage: "url('/noise.gif')" }}
                        />

                        {/* Glossy Top Highlight */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-100 z-10" />

                        {/* Content Container - Handles Scroll Internally */}
                        <div className="relative z-10 flex flex-col max-h-[85vh] w-full">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LiquidModal;
