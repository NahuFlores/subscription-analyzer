import LiquidModal from '../ui/LiquidModal';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import GrainBackground from '../ui/GrainBackground'; // Import GrainBackground
import { useState, useEffect } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { fetchWithAuth, USER_ID } from '../../config/api';

const SubscriptionModal = ({ isOpen, onClose, onSuccess, subscription = null }) => {
    const isEditing = !!subscription;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        category: 'Entertainment',
        renewal_date: ''
    });

    // Populate form data when opening in edit mode
    useEffect(() => {
        if (isOpen && subscription) {
            setFormData({
                name: subscription.name || '',
                cost: subscription.cost || '',
                category: subscription.category || 'Entertainment',
                renewal_date: subscription.next_billing_date || subscription.next_billing || ''
            });
        } else if (isOpen && !subscription) {
            // Reset if opening in add mode
            setFormData({
                name: '',
                cost: '',
                category: 'Entertainment',
                renewal_date: ''
            });
        }
    }, [isOpen, subscription]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const payload = {
                user_id: USER_ID,
                name: formData.name,
                cost: parseFloat(formData.cost),
                category: formData.category,
                billing_cycle: 'monthly',
                start_date: formData.renewal_date || new Date().toISOString().split('T')[0]
            };

            let response;
            if (isEditing) {
                // Edit (PUT)
                response = await fetchWithAuth(`/subscriptions/${subscription.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Add (POST)
                response = await fetchWithAuth('/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} subscription`);
            }

            // Trigger refresh and wait for it to complete before closing
            await onSuccess?.();

            // Close
            onClose();

        } catch (err) {
            console.error(`Failed to ${isEditing ? 'update' : 'add'} subscription:`, err);
            alert(`Error ${isEditing ? 'updating' : 'adding'} subscription: ` + (err.message || "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
        >
            {/* Ambient Background Animation - Grain Gradient Shader */}
            <GrainBackground />

            {/* Header Area */}
            <div className="px-8 pt-8 pb-4 relative z-20">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-50 cursor-pointer"
                >
                    <X size={20} />
                </button>

                <div className="mb-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm flex items-center gap-3">
                        {isEditing ? (
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
                                <Pencil size={18} />
                            </span>
                        ) : (
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
                                <Plus size={20} />
                            </span>
                        )}
                        {isEditing ? "Edit Subscription" : "New Subscription"}
                    </h2>
                    <p className="text-white/40 text-sm mt-2 ml-13 font-medium tracking-wide">
                        {isEditing ? "Update your subscription details below." : "Add a new service to track your expenses."}
                    </p>
                </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 pt-2 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Service Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Netflix, Spotify..."
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/20 hover:bg-white/8"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Cost & Category Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 ml-1">Monthly Cost</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-medium">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/20 hover:bg-white/8"
                                    value={formData.cost}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || parseFloat(val) >= 0) {
                                            setFormData({ ...formData, cost: val });
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 ml-1">Category</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/8"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                disabled={isSubmitting}
                            >
                                <option value="Entertainment" className="bg-[#1a1a1a]">Entertainment</option>
                                <option value="Productivity" className="bg-[#1a1a1a]">Productivity</option>
                                <option value="Utilities" className="bg-[#1a1a1a]">Utilities</option>
                                <option value="Social" className="bg-[#1a1a1a]">Social</option>
                                <option value="Health" className="bg-[#1a1a1a]">Health</option>
                                <option value="Other" className="bg-[#1a1a1a]">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Renewal Date</label>
                        <div className="relative z-50">
                            {/* Z-index boost for datepicker dropdown */}
                            <DatePicker
                                value={formData.renewal_date}
                                onChange={(date) => setFormData({ ...formData, renewal_date: date })}
                                placeholder="Select renewal date..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl py-3.5 hover:bg-white/5" disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="cta"
                            icon={isEditing ? Pencil : Plus}
                            className="flex-1 rounded-2xl py-3.5 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                            loading={isSubmitting}
                        >
                            {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update' : 'Add')}
                        </Button>
                    </div>
                </form>
            </div>
        </LiquidModal>
    );
};
export default SubscriptionModal;
