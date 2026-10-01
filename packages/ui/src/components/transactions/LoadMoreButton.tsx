import React, { useEffect, useRef } from 'react';
import { Loader2, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

export interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  loadedCount?: number;
  totalCount?: number;
  batchSize?: number;
  autoScroll?: boolean;
  className?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  hasMore,
  isLoading = false,
  loadedCount,
  totalCount,
  batchSize = 200,
  autoScroll = true,
  className = '',
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll || !hasMore || isLoading || typeof IntersectionObserver === 'undefined') return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [autoScroll, hasMore, isLoading, onLoadMore]);

  if (!hasMore) {
    if (!loadedCount || loadedCount === 0) return null;
    return (
      <div
        className={`flex items-center justify-center gap-2 py-6 text-xs text-slate-500 border-t border-slate-800/60 ${className}`}
        data-testid="load-more-complete"
      >
        <CheckCircle2 size={15} className="text-emerald-500/80" />
        <span>
          All {totalCount && totalCount > loadedCount ? totalCount : loadedCount} transactions loaded
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 pt-4 pb-8 border-t border-slate-800/80 ${className}`}
      data-testid="load-more-container"
    >
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{loadedCount || 0}</span>
        {totalCount !== undefined && totalCount > (loadedCount || 0) && (
          <>
            {' '}of <span className="font-semibold text-slate-200">{totalCount}</span>
          </>
        )}{' '}
        transactions
      </div>

      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:border-brand-500 hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        data-testid="load-more-button"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin text-brand-400" />
            <span>Loading more...</span>
          </>
        ) : (
          <>
            <ArrowDownCircle size={16} className="text-brand-400" />
            <span>Load More</span>
            {batchSize && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                +{batchSize}
              </span>
            )}
          </>
        )}
      </button>

      {/* Invisible sentinel element for infinite scroll auto-trigger */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
    </div>
  );
};
