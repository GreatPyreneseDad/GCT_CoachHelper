import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ContentSkeletonProps {
  className?: string;
  animate?: boolean;
}

// Dashboard stat card skeleton
export function StatCardSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Client list item skeleton
export function ClientItemSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Product card skeleton
export function ProductCardSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Session card skeleton
export function SessionCardSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 p-3", className)}>
      <div className="space-y-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

// Profile section skeleton
export function ProfileSectionSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// Form field skeleton
export function FormFieldSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

// Search result skeleton
export function SearchResultSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ 
  columns = 4, 
  className 
}: ContentSkeletonProps & { columns?: number }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === 0 ? "w-32" : "w-24",
            i === columns - 1 && "ml-auto"
          )} 
        />
      ))}
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn("flex items-start gap-3 p-3", className)}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ 
  height = 300,
  className 
}: ContentSkeletonProps & { height?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className={cn("w-full rounded-lg")} style={{ height }} />
      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}