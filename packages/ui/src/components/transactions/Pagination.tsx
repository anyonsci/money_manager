import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRows,
  onPageChange,
  loading = false
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-800/80 px-2 py-4">
      <div className="text-xs text-slate-400">
        Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalPages}</span>
        {totalRows !== undefined && (
          <span className="ml-1 text-slate-500">({totalRows} total entries)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
