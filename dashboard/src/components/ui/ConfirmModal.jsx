
import LiquidModal from './LiquidModal';
import Button from './Button';
import GrainBackground from './GrainBackground';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDangerous = true }) => {
    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-md! border border-white/10 border-b-red-500/50 shadow-[0_20px_50px_-12px_rgba(220,38,38,0.3)] bg-linear-to-t from-red-600/20 to-transparent"
        >
            {/* Red Grain Background */}
            <GrainBackground
                colors={["#dc2626", "#000000"]}
                height={650}
                width={500}
                scale={0.5}
            />

            {/* Close Button (Floating) */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-50 cursor-pointer"
            >
                <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center px-6 py-8 relative z-20">
                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 
                bg-linear-to-tr from-red-500/20 to-rose-500/10 text-red-500 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]
                border border-red-500/20 backdrop-blur-sm"
                >
                    <AlertTriangle size={36} strokeWidth={2} />
                </div>

                {/* Text */}
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">
                    {title}
                </h3>
                <p className="text-white/60 leading-relaxed text-sm mb-8 px-2">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-row justify-center gap-3 w-full">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="px-6 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 min-w-[100px]"
                    >
                        {cancelText}
                    </Button>

                    <Button
                        onClick={onConfirm}
                        variant="cta"
                        className="px-6 py-2.5 rounded-xl font-semibold min-w-[120px] 
                        bg-linear-to-r! from-red-600! via-red-500! to-orange-500! 
                        border-red-400/30! shadow-lg! shadow-red-500/20! hover:shadow-red-500/40!"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </LiquidModal>
    );
};

export default ConfirmModal;
