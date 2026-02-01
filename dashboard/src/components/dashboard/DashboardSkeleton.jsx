import GlassCard from '../ui/GlassCard';

const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
                    <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <GlassCard key={i} className="p-6 h-[140px] flex flex-col justify-between border-white/5">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-24 bg-white/10 rounded"></div>
                            <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 w-32 bg-white/10 rounded"></div>
                            <div className="h-3 w-20 bg-white/5 rounded"></div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 h-[400px] border-white/5">
                        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
                        <div className="h-full bg-linear-to-t from-white/5 to-transparent rounded-lg"></div>
                    </GlassCard>
                </div>
                <div>
                    <GlassCard className="p-6 h-[400px] border-white/5 flex flex-col items-center justify-center">
                        <div className="h-6 w-32 bg-white/10 rounded mb-8 self-start"></div>
                        <div className="h-48 w-48 rounded-full border-16 border-white/5"></div>
                    </GlassCard>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard className="p-0 h-[300px] border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between">
                            <div className="h-6 w-32 bg-white/10 rounded"></div>
                        </div>
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 w-full bg-white/5 rounded-xl"></div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
                <div>
                    <GlassCard className="p-6 h-[300px] border-white/5">
                        <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-24 w-full bg-white/5 rounded-xl border border-white/5"></div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
