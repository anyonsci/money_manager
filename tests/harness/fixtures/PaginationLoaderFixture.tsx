import React, { useState } from 'react';
import { Pagination, PageLoader, PwaInstallPrompt } from '@money-manager/ui';

export const PaginationLoaderFixture: React.FC = () => {
  const [page, setPage] = useState(2);

  return (
    <div className="space-y-10 p-6 max-w-2xl mx-auto" data-testid="pagination-loader-container">
      {/* Pagination component */}
      <section id="section-pagination">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Pagination Component
        </h2>
        <div data-testid="pagination-interactive" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <Pagination
            currentPage={page}
            totalPages={5}
            totalRows={125}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </section>

      {/* PageLoader component */}
      <section id="section-page-loader">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          PageLoader Component
        </h2>
        <div data-testid="page-loader-box" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <PageLoader message="Loading financial transactions and analytics..." />
        </div>
      </section>
    </div>
  );
};
