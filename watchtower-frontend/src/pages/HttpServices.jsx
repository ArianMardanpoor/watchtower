import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { getHttpServices } from '../api/http';
import { downloadExport } from '../api/client';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import HttpFilter from '../components/filters/HttpFilter';
import HttpTable from '../components/tables/HttpTable';

export default function HttpServices() {
  const { page, perPage, setPage, setPerPage } = usePagination(50);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '50' });

  const { data, isLoading } = useQuery({
    queryKey: ['http', filters],
    queryFn: () => getHttpServices(filters),
    keepPreviousData: true,
  });

  const exportUrl = `/export/urls`;

  const handleExport = async () => {
    const blob = await downloadExport(exportUrl, filters);
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'http-urls.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-primary">HTTP Services</h2>
        
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-background hover:bg-border text-primary text-sm px-4 py-2 rounded-md border border-border transition-colors"
        >
          <Download className="w-4 h-4" />
          Export URLs
        </button>
      </div>

      <HttpFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
      
      <HttpTable data={data} isLoading={isLoading} />

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