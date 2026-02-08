import GlassCard from '../ui/GlassCard';

const DashboardSkeleton = () => {
    // Helper helper for consistent shimmer blocks
    const ShimmerBlock = ({ className }) => (
        <div className={`animate-shimmer bg-white/5 ${className}`} />
    );

    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                    <ShimmerBlock className="h-8 w-48 rounded-xl" />
                    <ShimmerBlock className="h-4 w-64 rounded-lg" />
                </div>
                <ShimmerBlock className="h-12 w-48 rounded-2xl" /> {/* Button placeholder */}
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <GlassCard key={i} className="p-6 h-[140px] flex flex-col justify-between border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <ShimmerBlock className="h-4 w-24 rounded-md" />
                            <ShimmerBlock className="h-10 w-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <ShimmerBlock className="h-8 w-32 rounded-lg" />
                            <ShimmerBlock className="h-3 w-20 rounded-md opacity-70" />
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 h-[400px] border-white/5 relative overflow-hidden">
                        <ShimmerBlock className="h-6 w-48 rounded-md mb-6" />
                        <div className="h-full w-full flex items-end gap-2 pb-2">
                            {/* Simulation of bar chart data */}
                            {[...Array(12)].map((_, i) => (
                                <ShimmerBlock
                                    key={i}
                                    className="w-full rounded-t-lg"
                                    style={{ height: `${Math.random() * 60 + 30}%` }}
                                />
                            ))}
                        </div>
                    </GlassCard>
                </div>
                <div>
                    <GlassCard className="p-6 h-[400px] border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                        <ShimmerBlock className="h-6 w-32 rounded-md mb-8 self-start" />
                        <ShimmerBlock className="h-48 w-48 rounded-full" />
                    </GlassCard>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard className="p-0 h-[300px] border-white/5 relative overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between">
                            <ShimmerBlock className="h-6 w-32 rounded-md" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <ShimmerBlock key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </GlassCard>
                </div>
                <div>
                    <GlassCard className="p-6 h-[300px] border-white/5 relative overflow-hidden">
                        <ShimmerBlock className="h-6 w-32 rounded-md mb-6" />
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="p-4 border border-white/5 rounded-xl space-y-3">
                                    <ShimmerBlock className="h-4 w-3/4 rounded-md" />
                                    <ShimmerBlock className="h-3 w-1/2 rounded-md opacity-60" />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
