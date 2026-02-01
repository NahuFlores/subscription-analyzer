import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
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
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-100"
                        style={{
                            width: '100vw',
                            height: '100vh',
                            top: 0,
                            left: 0,
                            position: 'fixed'
                        }}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-2 sm:p-4" style={{ width: '100vw', height: '100vh' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-linear-to-br from-[#0f1218] to-[#1a1f2e] border border-white/10 border-t-white/20 w-full max-w-lg rounded-[20px] sm:rounded-[24px] shadow-2xl shadow-primary/5 pointer-events-auto flex flex-col backdrop-blur-xl"
                        >
                            {/* Header */}
                            <div className="px-5 py-3 sm:px-6 sm:py-4 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-white/5 to-white/2">
                                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-wide">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
