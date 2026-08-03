interface PaginationProps {
  page: number;
  totalPages: number;
  onLoadMore: () => void;
}

export const Pagination = ({ page, totalPages, onLoadMore }: PaginationProps) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={page >= totalPages}
        className="rounded-full bg-slate-800 px-3 py-2 font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {page >= totalPages ? 'All loaded' : 'Load more'}
      </button>
    </div>
  );
};
