import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import GlassCard from './GlassCard';

const Modal = ({ isOpen, onClose, title, children, className }) => {

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Also lock root to prevent mobile scroll
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
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={`fixed inset-0 flex items-center justify-center transition-opacity duration-200 ${isOpen ? 'z-100 opacity-100 pointer-events-auto' : 'z-[-1] opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <motion.div
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Modal Content */}
            <div className="relative z-101 w-full flex items-center justify-center p-4">
                <motion.div
                    initial={false}
                    animate={{
                        scale: isOpen ? 1 : 0.97,
                        opacity: isOpen ? 1 : 0,
                        y: isOpen ? 0 : 8
                    }}
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className={className || "bg-[#0f1218]/95 border border-white/10 w-full max-w-lg rounded-[24px] shadow-2xl flex flex-col backdrop-blur-xl"}
                >
                    {/* Header */}
                    {title && (
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                            <h3 id="modal-title" className="text-lg font-semibold text-white tracking-wide">{title}</h3>
                            <button
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    <div className={`p-0 max-h-[70vh] ${className?.includes('overflow-hidden') ? '' : 'overflow-y-auto'} ${className?.includes('scrollbar-hide') ? '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'custom-scrollbar'}`}>
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Modal;
