import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { getLiveSubdomains } from '../api/lives';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import LiveFilter from '../components/filters/LiveFilter';
import LiveTable from '../components/tables/LiveTable';

export default function LiveSubdomains() {
  const { page, perPage, setPage, setPerPage } = usePagination(100);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '100' });

  const { data, isLoading } = useQuery({
    queryKey: ['live', filters],
    queryFn: () => getLiveSubdomains(filters),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-primary">Live Infrastructure</h2>
        
        {/* برای این بخش API Export جداگانه نداشتید، پس دکمه خروجی را می‌توانیم موقتاً به عنوان Placeholder قرار دهیم یا بعداً در بک‌اند اضافه کنید */}
        <button
          disabled
          className="flex items-center justify-center gap-2 bg-background/50 text-primary-muted text-sm px-4 py-2 rounded-md border border-border cursor-not-allowed"
          title="Export feature coming soon"
        >
          <Download className="w-4 h-4" />
          Export IPs
        </button>
      </div>

      <LiveFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
      
      <LiveTable data={data} isLoading={isLoading} />

      {!isLoading && data?.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-surface border border-border rounded-lg p-4 text-sm text-primary mt-4">
          <div>
            Showing <span className="font-bold text-accent">{(page - 1) * perPage + 1}</span> to <span className="font-bold text-accent">{Math.min(page * perPage, data.total)}</span> of <span className="font-bold text-accent">{data.total}</span> entries
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="bg-background border border-border rounded px-2 py-1 outline-none"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={500}>500 per page</option>
            </select>

            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded bg-background border border-border hover:bg-border disabled:opacity-50 transition-colors">Prev</button>
              <span className="px-3 py-1 rounded bg-border border border-border">{page} / {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded bg-background border border-border hover:bg-border disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}