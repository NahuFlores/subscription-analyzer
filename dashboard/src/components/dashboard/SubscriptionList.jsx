import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../../config/api';
import ConfirmModal from '../ui/ConfirmModal';

const SubscriptionList = ({ subscriptions = [], onUpdate, onEdit, categoryFilter, onClearFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

    const filteredSubs = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter ? sub.category === categoryFilter : true;

        return matchesSearch && matchesCategory;
    });

    const handleDeleteClick = (sub) => {
        setSubscriptionToDelete(sub);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete || deletingId) return;

        const sub = subscriptionToDelete;
        setDeletingId(sub.id);
        // Keep modal open - don't close until complete

        try {
            const response = await fetchWithAuth(`/subscriptions/${sub.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete subscription');
            }

            await onUpdate?.(); // Wait for data refresh to complete
            toast.success(`${sub.name} deleted successfully!`);
            setDeleteModalOpen(false); // Close modal after success
        } catch (err) {
            console.error("Failed to delete subscription:", err);
            toast.error(err.message || "Failed to delete subscription");
        } finally {
            setDeletingId(null);
            setSubscriptionToDelete(null);
        }
    };

    const handleEdit = (sub) => {
        if (onEdit) {
            onEdit(sub);
        } else {
            console.warn('onEdit handler not provided');
        }
    };

    return (
        <>
            <GlassCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-[24px] p-6 h-full min-h-[300px] max-h-[600px] flex flex-col"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
                    <h2 className="text-xl font-bold text-white">Your Subscriptions</h2>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Banner */}
                {categoryFilter && (
                    <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm text-white">
                                Reviewing <span className="font-bold text-primary">{categoryFilter}</span> subscriptions
                            </span>
                        </div>
                        <button
                            onClick={onClearFilter}
                            className="text-xs font-bold text-primary hover:text-white px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}

                {/* List */}
                <div className="overflow-y-auto custom-scrollbar space-y-3 pr-2 flex-1">
                    {filteredSubs.length > 0 ? (
                        filteredSubs.map((sub, index) => (
                            <motion.div
                                key={sub.id ? String(sub.id) : `sub-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group p-4 rounded-2xl bg-white/2 hover:bg-white/8 border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 backdrop-blur-sm relative"
                            >
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {/* Icon Placeholder */}
                                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-xl font-bold text-primary group-hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20 group-hover:shadow-primary/10 shrink-0">
                                        {sub.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-white tracking-wide text-lg group-hover:text-primary transition-colors truncate">{sub.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mt-1">
                                            <span className="bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 font-medium whitespace-nowrap">{sub.category}</span>
                                            <span className="hidden sm:inline opacity-50">•</span>
                                            <span className="whitespace-nowrap">
                                                Next: {(() => {
                                                    const dateStr = sub.next_billing_date || sub.next_billing;
                                                    if (!dateStr) return 'N/A';
                                                    try {
                                                        const date = new Date(dateStr);
                                                        if (isNaN(date.getTime())) return 'N/A';
                                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                    } catch {
                                                        return 'N/A';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto relative sm:min-h-[40px]">
                                    {/* Cost */}
                                    <div className="text-left sm:text-right transition-transform duration-300 sm:group-hover:-translate-x-[96px]">
                                        <div className="font-bold text-white text-xl tracking-tight">${sub.cost.toFixed(2)}</div>
                                        <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">
                                            {(() => {
                                                const labels = {
                                                    monthly: '/ mo',
                                                    annual: '/ yr',
                                                    weekly: '/ wk'
                                                };
                                                return labels[sub.billing_cycle] || `/${sub.billing_cycle}`;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex sm:absolute sm:right-0 gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                                            title="Edit subscription"
                                            aria-label={`Edit ${sub.name}`}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(sub)}
                                            disabled={deletingId === sub.id}
                                            className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            title="Delete subscription"
                                            aria-label={`Delete ${sub.name}`}
                                        >
                                            {deletingId === sub.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            {searchTerm ? (
                                <>
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                        <Search size={28} className="text-text-secondary" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                                    <p className="text-text-secondary text-sm max-w-[220px]">
                                        Try adjusting your search terms
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                                        <Plus size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No subscriptions yet</h3>
                                    <p className="text-text-secondary text-sm max-w-[220px] mb-4">
                                        Start tracking your recurring payments to get insights
                                    </p>
                                    <p className="text-xs text-text-secondary/60">
                                        Click the <span className="text-primary font-medium">+</span> button above to add your first subscription
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </GlassCard>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => !deletingId && setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Subscription?"
                message={`Are you sure you want to delete ${subscriptionToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                loading={!!deletingId}
            />
        </>
    );
};

export default SubscriptionList;
