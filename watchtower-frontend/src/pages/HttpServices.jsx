import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, ServerCrash, AlertCircle } from 'lucide-react';
import { getHttpServices } from '../api/http';
import { downloadExport } from '../api/client';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import HttpFilter from '../components/filters/HttpFilter';
import HttpTable from '../components/tables/HttpTable';

export default function HttpServices() {
  const { page, perPage, setPage, setPerPage } = usePagination(50);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '50' });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setFilter('page', newPage.toString());
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setFilter('per_page', newPerPage.toString());
    handlePageChange(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['http', filters],
    queryFn: () => getHttpServices(filters),
    placeholderData: (prev) => prev,
  });

  const exportUrl = `/export/urls`;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      const blob = await downloadExport(exportUrl, filters);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'http-urls.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ServerCrash className="w-6 h-6 text-warning" />
          HTTP Services
        </h2>
        
        <div className="flex items-center gap-2">
          {exportError && <span className="text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {exportError}</span>}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || isLoading || !data?.data?.length}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export URLs'}
          </button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <HttpFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
      </div>
      
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        <HttpTable data={data} isLoading={isLoading} />
      </div>

      {!isLoading && data?.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-surface border border-border/50 shadow-sm rounded-xl p-5 text-sm text-primary">
          <div className="font-medium">
             Showing <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{(page - 1) * perPage + 1}</span> to <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{Math.min(page * perPage, data.total)}</span> of <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{data.total}</span> entries
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <div className="flex gap-2 font-medium">
              <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Prev</button>
              <span className="px-4 py-2 rounded-lg bg-surface border border-border flex items-center justify-center min-w-[3rem] shadow-inner">{page} / {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => handlePageChange(page + 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}