import Modal from '../ui/Modal';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { buildApiUrl } from '../../config/api';

const AddSubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        category: 'Entertainment',
        renewal_date: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const payload = {
                user_id: 'demo_user',
                name: formData.name,
                cost: parseFloat(formData.cost),
                category: formData.category,
                billing_cycle: 'monthly',
                start_date: formData.renewal_date || new Date().toISOString().split('T')[0]
            };

            const response = await fetch(buildApiUrl('/subscriptions'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add subscription');
            }

            // Success
            console.log('✅ Subscription added successfully');

            // Trigger refresh immediately
            await onSuccess?.();

            // Close and reset
            onClose();
            setFormData({ name: '', cost: '', category: 'Entertainment', renewal_date: '' });

        } catch (err) {
            console.error("Failed to add subscription:", err);
            alert("Error adding subscription: " + (err.message || "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Subscription">
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Service Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Netflix, Spotify, Adobe..."
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all placeholder:text-white/30"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Cost & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-secondary">Monthly Cost</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all placeholder:text-white/30"
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-secondary">Category</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all appearance-none cursor-pointer"
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
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Renewal Date</label>
                    <DatePicker
                        value={formData.renewal_date}
                        onChange={(date) => setFormData({ ...formData, renewal_date: date })}
                        placeholder="Select renewal date..."
                        disabled={isSubmitting}
                    />
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="cta"
                        icon={Plus}
                        className="flex-1"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Subscription'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddSubscriptionModal;
