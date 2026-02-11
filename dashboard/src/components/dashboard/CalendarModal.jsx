import LiquidModal from '../ui/LiquidModal';
import PaymentCalendar from './PaymentCalendar';
import { X } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, subscriptions }) => {
    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-6xl max-h-[90vh]"
        >
            {/* Ambient Background Animation Removed */}

            {/* Header Area */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/5 flex items-center justify-between relative z-20 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Payment Calendar</h2>
                    <p className="text-sm text-text-secondary">Track upcoming expenses</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-6 relative z-10">
                <PaymentCalendar subscriptions={subscriptions} />
            </div>
        </LiquidModal>
    );
};

export default CalendarModal;
