import { cn } from '@/lib/utils';

interface PageSkeletonProps {
    variant?: 'dashboard' | 'list' | 'detail' | 'form' | 'default';
    className?: string;
}

function SkeletonPulse({ className }: { className?: string }) {
    return <div className={cn('skeleton-shine', className)} />;
}

export function PageSkeleton({ variant = 'default', className }: PageSkeletonProps) {
    return (
        <div className={cn('animate-fade-in', className)}>
            {/* Header skeleton */}
            <div className="mb-6 space-y-2">
                <SkeletonPulse className="h-8 w-48 rounded-lg" />
                <SkeletonPulse className="h-4 w-64 rounded" />
            </div>

            {variant === 'dashboard' && <DashboardSkeleton />}
            {variant === 'list' && <ListSkeleton />}
            {variant === 'detail' && <DetailSkeleton />}
            {variant === 'form' && <FormSkeleton />}
            {variant === 'default' && <DefaultSkeleton />}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card-mobile-compact">
                        <SkeletonPulse className="h-4 w-20 rounded mb-2" />
                        <SkeletonPulse className="h-7 w-28 rounded-lg mb-1" />
                        <SkeletonPulse className="h-3 w-16 rounded" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="card-mobile">
                    <SkeletonPulse className="h-5 w-32 rounded mb-4" />
                    <SkeletonPulse className="h-48 w-full rounded-xl" />
                </div>
                <div className="card-mobile">
                    <SkeletonPulse className="h-5 w-40 rounded mb-4" />
                    <SkeletonPulse className="h-48 w-full rounded-xl" />
                </div>
            </div>

            {/* Bottom chart */}
            <div className="card-mobile mt-4">
                <SkeletonPulse className="h-5 w-48 rounded mb-4" />
                <SkeletonPulse className="h-56 w-full rounded-xl" />
            </div>
        </>
    );
}

function ListSkeleton() {
    return (
        <div className="card-mobile p-0 divide-y divide-border">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                    <SkeletonPulse className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonPulse className="h-4 w-3/4 rounded" />
                        <SkeletonPulse className="h-3 w-1/2 rounded" />
                    </div>
                    <SkeletonPulse className="h-5 w-20 rounded" />
                </div>
            ))}
        </div>
    );
}

function DetailSkeleton() {
    return (
        <>
            {/* Hero card */}
            <div className="card-mobile mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <SkeletonPulse className="h-16 w-16 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <SkeletonPulse className="h-6 w-40 rounded-lg" />
                        <SkeletonPulse className="h-4 w-24 rounded" />
                    </div>
                </div>
                <SkeletonPulse className="h-10 w-full rounded-xl" />
            </div>

            {/* Details */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="card-mobile-compact flex justify-between items-center">
                        <SkeletonPulse className="h-4 w-24 rounded" />
                        <SkeletonPulse className="h-5 w-32 rounded" />
                    </div>
                ))}
            </div>
        </>
    );
}

function FormSkeleton() {
    return (
        <div className="card-mobile space-y-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <SkeletonPulse className="h-4 w-24 rounded" />
                    <SkeletonPulse className="h-12 w-full rounded-xl" />
                </div>
            ))}
            <SkeletonPulse className="h-12 w-full rounded-xl mt-4" />
        </div>
    );
}

function DefaultSkeleton() {
    return (
        <div className="space-y-6">
            <div className="card-mobile">
                <SkeletonPulse className="h-32 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="card-mobile-compact">
                    <SkeletonPulse className="h-24 w-full rounded-lg" />
                </div>
                <div className="card-mobile-compact">
                    <SkeletonPulse className="h-24 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Export individual skeleton components for custom compositions
export { SkeletonPulse, DashboardSkeleton, ListSkeleton, DetailSkeleton, FormSkeleton };
