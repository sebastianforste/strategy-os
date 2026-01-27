import { motion } from "framer-motion";

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-[555px] mx-auto bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-[90%] bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-[95%] bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-[80%] bg-white/5 rounded animate-pulse" />
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
        <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
        <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
        <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
